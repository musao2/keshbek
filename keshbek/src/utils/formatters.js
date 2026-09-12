/**
 * Umumiy formatlash funksiyalari (DRY tamoyili asosida)
 */

/**
 * Summani chiroyli o'qiladigan formatga o'tkazish (masalan: 27 500 so'm)
 * @param {number|string} n - Summa
 * @returns {string} Formatlangan summa matni
 */
export const formatSum = (n) => {
  const amount = Number(n || 0);
  return amount.toLocaleString('uz-UZ') + " so'm";
};

/**
 * Sanani o'qiladigan formatga o'tkazish (Bugun, Kecha yoki DD.MM.YYYY)
 * @param {string} iso - ISO sana formati
 * @returns {string} Formatlangan sana matni
 */
export const formatDate = (iso) => {
  if (!iso) return '—';
  
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();

  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return `Bugun, ${hour}:${minute}`;
  if (isYesterday) return `Kecha, ${hour}:${minute}`;
  return `${day}.${month}.${year} ${hour}:${minute}`;
};

/**
 * Telefon raqamini o'qish uchun qulay formatga o'tkazish (+998 90 123 45 67)
 * @param {string} rawPhone - +998901234567 formatidagi raqam
 * @returns {string} Formatlangan telefon raqami
 */
export const formatPhone = (rawPhone) => {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('998')) digits = digits.slice(3);
  digits = digits.slice(0, 9);

  let formatted = '+998';
  if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
  if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
  if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
  if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);
  
  return formatted;
};
