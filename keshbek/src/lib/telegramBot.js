// Telegram bot orqali OTP jo'natish
const BOT_TOKEN = '8662778042:AAETU06gnUqN2IbY8aYNInDFqU8zG8H81Sw';
// Diqqat: chat_id kerak bo'ladi, agar har bir userning chat_id'sini bilmasak, admin guruhiga yoki ma'lum bir id'ga jo'natish mumkin.
// Hozircha umumiy logika sifatida chat_id'ni param sifatida qo'shib qo'yamiz yoki siz uni belgilab berasiz.
// Default chat_id ni shu yerga yozishingiz mumkin (masalan o'zingizniki testing uchun)
const DEFAULT_CHAT_ID = ''; 

// Tasodifiy 4 xonali OTP kod
const generateOTP = () => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

/**
 * OTP kodni Telegram API orqali jo'natish
 */
export const sendOTPViaTelegram = async (phone) => {
  try {
    const code = generateOTP();
    const text = `Sizning Keshbek tasdiqlash kodingiz:\n\n*${code}*\n\nRaqam: ${phone}`;

    // Agar DEFAULT_CHAT_ID ko'rsatilmagan bo'lsa, xato bermasdan konsolga chiqaramiz (hozircha)
    if (!DEFAULT_CHAT_ID) {
      console.warn('Telegram chat_id kiritilmagan. Kod:', code);
      // Backend yo'qligi sababli localStorage da saqlaymiz, toki keyin tekshirib olish uchun
      localStorage.setItem(`otp_${phone}`, JSON.stringify({ code, expiresAt: Date.now() + 5 * 60 * 1000 }));
      return { success: true, code };
    }

    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: DEFAULT_CHAT_ID,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    if (!response.ok) {
      throw new Error("Telegram'ga yuborishda xatolik");
    }

    // OTP'ni frontend'da vaqtinchalik tekshirish uchun saqlash (backend o'rniga fallback)
    localStorage.setItem(`otp_${phone}`, JSON.stringify({ code, expiresAt: Date.now() + 5 * 60 * 1000 }));

    return { success: true, code };

  } catch (err) {
    return { error: 'Xatolik: ' + err.message };
  }
};

