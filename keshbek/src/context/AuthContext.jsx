import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem('user');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  const [profile, setProfile] = useState(() => {
    const cachedProfile = localStorage.getItem('profile');
    return cachedProfile ? JSON.parse(cachedProfile) : null;
  });
  const [loading, setLoading] = useState(true);

  // Dastlabki yuklanishda tokenni tekshirish va profilni yuklash
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        // Agar keshda user ma'lumotlari bo'lsa, yuklanishni darhol to'xtatamiz
        if (localStorage.getItem('user')) {
          setLoading(false);
        }
        
        try {
          const data = await api.get('/me'); 
          const userData = data?.data || data;
          setProfile(userData);
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('profile', JSON.stringify(userData));
        } catch (error) {
          // console.error("Token yaroqsiz", error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('profile');
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const sendOTP = async (phone) => {
    try {
      // Backendga OTP jo'natish so'rovi
      await api.post('/auth/otp/send', { phone });
      return { success: true };
    } catch (error) {
      return { error: error.message || 'OTP yuborishda xatolik yuz berdi' };
    }
  };

  const verifyOTPAndLogin = async (phone, code, firstName = '', lastName = '') => {
    try {
      const cleanPhone = phone.trim();
      const cleanCode = code.trim();
      
      const fName = firstName.trim() || 'User';
      const lName = lastName.trim() || '';
      const fullName = `${fName} ${lName}`.trim();

      // OTP ni tekshirish va login qilish
      const response = await api.post('/auth/otp/verify', {
        phone: cleanPhone,
        code: cleanCode,
        firstName: fName,
        lastName: lName,
        name: fullName
      });

      // Backenddan tokenlar keladi
      let accessToken = null;
      let refreshToken = null;

      if (typeof response === 'string') {
        accessToken = response;
      } else if (response) {
        accessToken = response.accessToken || response.access_token || response.token ||
                      (response.tokens && (response.tokens.accessToken || response.tokens.access_token || (response.tokens.access && response.tokens.access.token))) ||
                      (response.data && (response.data.accessToken || response.data.access_token || response.data.token));
                      
        refreshToken = response.refreshToken || response.refresh_token ||
                       (response.tokens && (response.tokens.refreshToken || response.tokens.refresh_token || (response.tokens.refresh && response.tokens.refresh.token))) ||
                       (response.data && (response.data.refreshToken || response.data.refresh_token));
      }

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        const userData = response.user || (response.data && response.data.user) || { id: 'dummy_user', phone: cleanPhone };
        setUser(userData);
        setProfile(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('profile', JSON.stringify(userData));

        // Yangi foydalanuvchimi yoki yo'qmi tekshiramiz:
        // Ism bo'sh yoki "User" bo'lsa yangi foydalanuvchi deb hisoblaymiz
        const userName = userData.firstName || userData.name || userData.fullName || '';
        const isNewUser = !userName || userName === 'User' || userName.trim() === '';

        // Tokendan keyin to'liq profilni ham bitta chaqirib qo'yishimiz mumkin:
        refreshProfile();
        
        return { success: true, isNewUser };
      } else {
        return { error: 'Token olinmadi. Iltimos qaytadan urinib koring. Konsolni tekshiring (F12).' };
      }

    } catch (error) {
      return { error: error.message || 'Tasdiqlashda xatolik yuz berdi' };
    }
  };


  const updateProfileName = async (nameData) => {
    // console.log("[AuthContext] updateProfileName ishga tushdi:", nameData);
    try {
      let fName = '';
      let lName = '';
      let fullName = '';

      if (typeof nameData === 'string') {
        fullName = nameData.trim();
        const parts = fullName.split(' ');
        fName = parts[0] || '';
        lName = parts.slice(1).join(' ') || '';
      } else {
        fName = nameData.firstName?.trim() || '';
        lName = nameData.lastName?.trim() || '';
        fullName = `${fName} ${lName}`.trim();
      }

      // console.log("[AuthContext] PATCH /me yuborilmoqda:", { firstName: fName, lastName: lName, name: fullName });
      
      const response = await api.patch('/me', {
        firstName: fName,
        lastName: lName,
        name: fullName
      });
      
      // console.log("[AuthContext] PATCH /me javobi:", response);

      // React stateni darhol yangilaymiz ki modal yopilsin
      setProfile(prev => {
        const updated = prev ? { ...prev, name: fullName, firstName: fName, lastName: lName } : null;
        if(updated) localStorage.setItem('profile', JSON.stringify(updated));
        return updated;
      });
      setUser(prev => {
        const updated = prev ? { ...prev, name: fullName, firstName: fName, lastName: lName } : null;
        if(updated) localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });

      // console.log("[AuthContext] refreshProfile() chaqirilmoqda...");
      await refreshProfile();
      // console.log("[AuthContext] Profil yangilandi!");
      
      return { success: true };
    } catch (error) {
      // console.error("[AuthContext] XATOLIK ushlandi:", error);
      return { error: error.message || 'Profilni yangilashda xatolik yuz berdi' };
    }
  };

  const signOut = async () => {
    try {
      await api.post('/auth/logout', {});
    } catch (e) {
      // console.error(e);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const data = await api.get('/me');
        const userData = data?.data || data;
        setProfile(userData);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('profile', JSON.stringify(userData));
      }
    } catch (e) {
      // console.error("Profilni yangilashda xatolik", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, sendOTP, verifyOTPAndLogin, updateProfileName, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
