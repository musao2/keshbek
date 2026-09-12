// KeshBak — Markazlashtirilgan API client
// .env da VITE_API_URL va VITE_API_TIMEOUT belgilanadi

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const API_TIMEOUT  = Number(import.meta.env.VITE_API_TIMEOUT) || 10000; // 10 soniya default

// Production muhitida HTTPS majburiy
if (import.meta.env.VITE_ENVIRONMENT === 'production' && !API_BASE_URL.startsWith('https://')) {
  console.warn('[KeshBak] Xavfsizlik ogohlantirilishi: Production muhitida HTTPS ishlatilishi shart!');
}

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map(cb => cb(token));
  refreshSubscribers = [];
};

/**
 * AbortController orqali timeout qo'shish
 * Agar server VITE_API_TIMEOUT ms ichida javob bermasa, so'rov bekor qilinadi
 */
function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
}

/**
 * Fetch funksiyasini qulaylashtirish uchun yordamchi funksiya
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // LocalStorage'dan tokenni olish (agar mavjud bo'lsa)
  let token = localStorage.getItem('accessToken');

  const getHeaders = (currentToken) => ({
    'Content-Type': 'application/json',
    ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {}),
    ...options.headers,
  });

  let response;
  try {
    response = await fetchWithTimeout(
      url,
      { ...options, headers: getHeaders(token) },
      API_TIMEOUT
    );
  } catch (networkError) {
    // Timeout yoki tarmoq uzilishi
    if (networkError?.name === 'AbortError') {
      throw new Error('So\'rov juda ko\'p vaqt oldi. Iltimos, internet aloqangizni tekshiring va qayta urinib ko\'ring.');
    }
    throw new Error('Internet ishlamayapti, iltimos aloqangizni tekshiring');
  }

  // Token eskirgan bo'lsa va refresh so'rovi bo'lmasa
  if (response.status === 401 && !endpoint.includes('/auth/')) {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const retryOriginalRequest = new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (!newToken) {
            reject(new Error('Sessiya muddati tugadi, iltimos qayta tizimga kiring'));
            return;
          }
          fetchWithTimeout(url, { ...options, headers: getHeaders(newToken) }, API_TIMEOUT)
            .then(res => resolve(handleResponse(res)))
            .catch(() => reject(new Error('Internet ishlamayapti, iltimos aloqangizni tekshiring')));
        });
      });

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetchWithTimeout(
            `${API_BASE_URL}/auth/refresh`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken })
            },
            API_TIMEOUT
          );

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            const newAccessToken =
              data.accessToken || data.access_token || data.token ||
              (data.tokens && (data.tokens.accessToken || data.tokens.access?.token)) ||
              (data.data && data.data.accessToken);
            const newRefreshToken =
              data.refreshToken || data.refresh_token ||
              (data.tokens && (data.tokens.refreshToken || data.tokens.refresh?.token)) ||
              (data.data && data.data.refreshToken);

            if (newAccessToken) {
              localStorage.setItem('accessToken', newAccessToken);
              if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken);
              onRefreshed(newAccessToken);
            } else {
              onRefreshed(null);
            }
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/';
            onRefreshed(null);
          }
        } catch (error) {
          onRefreshed(null);
        } finally {
          isRefreshing = false;
        }
      }

      return retryOriginalRequest;
    }
  }

  return handleResponse(response);
}


async function handleResponse(response) {
  if (!response.ok) {
    let errMsg = "Xatolik yuz berdi, qaytadan urinib ko'ring";
    try {
      const errorData = await response.json();
      if (errorData.message && typeof errorData.message === 'string') {
        errMsg = errorData.message;
      } else if (Array.isArray(errorData.message)) {
        errMsg = errorData.message.join(', ');
      } else if (errorData.error && typeof errorData.error === 'string') {
        errMsg = errorData.error;
      }
    } catch(e) {}
    throw new Error(errMsg);
  }

  // Ba'zi endpointlar 204 No Content qaytarishi mumkin
  if (response.status === 204) {
    return null;
  }

  return response.json();
}


export const api = {
  get:    (endpoint)        => fetchAPI(endpoint, { method: 'GET' }),
  post:   (endpoint, body)  => fetchAPI(endpoint, { method: 'POST',  body: JSON.stringify(body) }),
  put:    (endpoint, body)  => fetchAPI(endpoint, { method: 'PUT',   body: JSON.stringify(body) }),
  patch:  (endpoint, body)  => fetchAPI(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint)        => fetchAPI(endpoint, { method: 'DELETE' }),
};
