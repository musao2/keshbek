import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useStationSettings } from '../hooks/useStationSettings';
import { BsFuelPump } from 'react-icons/bs';
import { IoPhonePortraitOutline, IoKeyOutline, IoArrowBackOutline, IoSendOutline } from 'react-icons/io5';
import { FaTelegramPlane } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi2';

const LoginPage = () => {
  const { sendOTP, verifyOTPAndLogin } = useAuth();
  const { station } = useStationSettings();

  const [mode, setMode]       = useState('login'); // 'login' | 'register'
  const [step, setStep]       = useState(1);       // 1: Telefon/Ism kiritish, 2: Kod kiritish
  
  const [phone, setPhone]     = useState('+998');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [code, setCode]       = useState('');
  
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [notRegistered, setNotRegistered] = useState(false);

  // Telefon raqamini chiroyli formatlash (+998 90 123 45 67)
  const handlePhoneChange = (inputVal) => {
    let digits = inputVal.replace(/\D/g, '');
    if (digits.startsWith('998')) {
      digits = digits.slice(3);
    }
    digits = digits.slice(0, 9);

    let formatted = '+998';
    if (digits.length > 0) formatted += ' ' + digits.slice(0, 2);
    if (digits.length > 2) formatted += ' ' + digits.slice(2, 5);
    if (digits.length > 5) formatted += ' ' + digits.slice(5, 7);
    if (digits.length > 7) formatted += ' ' + digits.slice(7, 9);

    setPhone(formatted);
    if (error) setError('');
    if (notRegistered) setNotRegistered(false);
  };

  // Telefon raqam formatini tekshirish
  const validatePhone = (num) => {
    const digits = num.replace(/\D/g, '');
    if (digits.length !== 12 || !digits.startsWith('998')) return false;
    return true;
  };

  // 1-qadam: Kod yuborish
  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!validatePhone(cleanPhone)) {
      setError('Telefon raqamini to\'liq kiriting. Namuna: +998 90 123 45 67');
      return;
    }

    setLoading(true);
    const res = await sendOTP(cleanPhone);
    setLoading(false);

    if (res.error) {
      // Istalgan xatolik = foydalanuvchi botda ro'yxatdan o'tmagan
      setNotRegistered(true);
      setError('');
    } else {
      setNotRegistered(false);
      setStep(2);
      setError('');
    }
  };

  // 2-qadam: Kodni tekshirish va kirish
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');

    if (code.trim().length !== 4) {
      setError('Tasdiqlash kodi 4 xonali bo\'lishi kerak.');
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, '');
    const res = await verifyOTPAndLogin(cleanPhone, code, firstName, lastName);
    setLoading(false);

    if (res.error) {
      setNotRegistered(true);
      setError('');
    }
  };

  // Telegram banneri — faqat shu qism chiroyli qilib yozildi
  const TelegramBanner = () => (
    <div className="rounded-2xl overflow-hidden border border-[#2AABEE]/20"
      style={{ boxShadow: '0 4px 20px rgba(42,171,238,0.15)' }}
    >
      {/* Yuqori qism — gradient fon */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3"
        style={{ background: 'linear-gradient(135deg, #2AABEE 0%, #1a9fd8 100%)' }}
      >
        <div className="w-9 h-9 bg-white/25 rounded-xl flex items-center justify-center shrink-0 border border-white/30">
          <FaTelegramPlane size={17} className="text-white" />
        </div>
        <div>
          <p className="font-extrabold text-[14px] text-white leading-tight">
            Siz hali ro'yxatdan o'tmagansiz
          </p>
          <p className="text-white/80 text-[12px] mt-0.5 leading-snug">
            Telegram botimiz orqali ro'yxatdan o'ting va keshbek yig'ishni boshlang!
          </p>
        </div>
      </div>

      {/* Pastki qism — tugma */}
      <a
        href="https://t.me/keshbakbot"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-4 py-3 bg-white group active:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2AABEE, #1a9fd8)' }}
          >
            <FaTelegramPlane size={13} className="text-white" />
          </div>
          <span className="font-bold text-[13px] text-gray-800">
            @keshbakbot da ro'yxatdan o'tish
          </span>
        </div>
        <HiArrowRight size={16} className="text-[#2AABEE] group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f7b4c] via-[#0a5c39] to-[#063d27] flex flex-col items-center justify-center px-6">

      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20">
          <BsFuelPump size={32} className="text-white" />
        </div>
        <h1 className="text-[28px] font-extrabold text-white tracking-tight">KeshBak</h1>
        <p className="text-white/60 text-[13px] mt-1">{station?.name || 'Yuklanmoqda...'}</p>
      </div>

      {/* Forma kartasi */}
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">

        {/* Tab (Kirish va Ro'yxatdan o'tish) */}
        {step === 1 && (
          <div className="flex bg-gray-100 rounded-2xl p-1 mb-5">
            <button
              onClick={() => { setMode('login'); setError(''); setNotRegistered(false); }}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
                mode === 'login' ? 'bg-white text-[#0f7b4c] shadow-sm scale-[1.02]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Kirish
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setNotRegistered(false); }}
              className={`flex-1 py-2.5 rounded-xl text-[14px] font-bold transition-all ${
                mode === 'register' ? 'bg-white text-[#0f7b4c] shadow-sm scale-[1.02]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              Ro'yxatdan o'tish
            </button>
          </div>
        )}

        {/* 1-QADAM: Ro'yxatdan o'tish bo'limi */}
        {step === 1 && mode === 'register' && (
          <div className="flex flex-col items-center justify-center gap-5 py-4">
            <div className="text-center">
              <h3 className="text-gray-800 text-[16px] font-bold mb-2">Telegram orqali ro'yxatdan o'ting</h3>
              <p className="text-gray-500 text-[13px] leading-relaxed">
                Tizimdan to'liq foydalanish va keshbeklarni yig'ish uchun bizning Telegram botimiz orqali ro'yxatdan o'tishingiz kerak.
              </p>
            </div>
            
            <a
              href="https://t.me/keshbakbot"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-12 bg-[#2AABEE] hover:bg-[#229ED9] rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#2AABEE]/20"
            >
              <IoSendOutline size={18} />
              @keshbakbot ga o'tish
            </a>

            <button
              type="button"
              onClick={() => setMode('login')}
              className="text-[#0f7b4c] text-[13px] font-bold hover:underline text-center mt-1"
            >
              Ro'yxatdan o'tganmisiz? Kirish ➔
            </button>
          </div>
        )}

        {step === 1 && mode === 'login' && (
          <form onSubmit={handleSendCode} className="flex flex-col gap-4">
            <div className="relative">
              <IoPhonePortraitOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                placeholder="+998 90 123 45 67"
                maxLength={17}
                value={phone}
                onChange={e => handlePhoneChange(e.target.value)}
                required
                className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-[14px] font-semibold text-gray-800 outline-none focus:border-[#0f7b4c] transition-colors"
              />
            </div>

            {/* Telegram banner */}
            {notRegistered && <TelegramBanner />}

            {error && !notRegistered && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-[13px] font-medium leading-snug">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0f7b4c] rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60 shadow-lg shadow-[#0f7b4c]/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <IoSendOutline size={18} />
                  Kod yuborish
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMode('register')}
              className="text-[#0f7b4c] text-[12px] font-bold hover:underline text-center mt-1"
            >
              Hali ro'yxatdan o'tmaganmisiz? Ro'yxatdan o'tish ➔
            </button>
          </form>
        )}

        {/* 2-QADAM: KODNI TASDIQLASH */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => { setStep(1); setError(''); setNotRegistered(false); }}
              className="flex items-center gap-1.5 text-[#0f7b4c] text-[13px] font-bold self-start mb-2"
            >
              <IoArrowBackOutline size={16} />
              Raqamni o'zgartirish
            </button>

            <p className="text-gray-500 text-[13px] text-center mb-1">
              Tasdiqlash kodi <span className="font-bold text-gray-800">{phone}</span> raqamiga yuborildi.
            </p>

            {/* OTP kod input */}
            <div className="relative">
              <IoKeyOutline size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="4 xonali kod"
                maxLength={4}
                value={code}
                onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setNotRegistered(false); }}
                required
                className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-[14px] text-gray-800 outline-none text-center tracking-[12px] font-bold focus:border-[#0f7b4c] transition-colors"
              />
            </div>

            {/* Telegram banner (2-qadamda ham) */}
            {notRegistered && <TelegramBanner />}

            {error && !notRegistered && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-600 text-[13px] font-medium leading-snug">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#0f7b4c] rounded-xl text-white font-bold text-[15px] flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Tasdiqlash va Kirish'
              )}
            </button>
          </form>
        )}
      </div>

      <p className="text-white/40 text-[12px] mt-6 text-center">
        KeshBak © 2024 — OTP Tizimi
      </p>
    </div>
  );
};

export default LoginPage;
