import React, { useState } from 'react';
import {
  HiUserCircle,
  HiWallet,
  HiSquare2Stack,
  HiPhone,
  HiQuestionMarkCircle,
  HiArrowLeftOnRectangle,
  HiChevronRight,
  HiShieldCheck,
  HiBell,
  HiXMark,
  HiLockClosed,
  HiPencilSquare,
  HiCreditCard,
  HiCalendarDays,
  HiReceiptPercent,
  HiPaperAirplane,
} from 'react-icons/hi2';
import { RiGasStationFill } from 'react-icons/ri';
import { FaCrown, FaTrophy, FaMedal, FaShieldHalved } from 'react-icons/fa6';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useStationSettings } from '../hooks/useStationSettings';
import { useSummary } from '../hooks/useSummary';

const formatSum = (n) => Number(n || 0).toLocaleString('uz-UZ') + " so'm";

// Karta raqamini to'g'ri ko'rsatish:
// Agar raqamda '-' mavjud bo'lsa (masalan KB-2026-2826) — shunday ko'rsat
// Agar faqat raqamlar bo'lsa — har 4 ta raqamdan keyin bo'sh joy qo'y
const formatCardNumber = (num) => {
  if (!num) return '—';
  const s = String(num).trim();
  // Agar allaqachon '-' bor bo'lsa, saqlab qo'y
  if (s.includes('-')) return s;
  // Faqat raqamlar bo'lsa, har 4 tadan bo'sh joy
  const digits = s.replace(/\s/g, '');
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const ProfilePage = () => {
  const { profile, signOut, user, updateProfileName } = useAuth();
  const { transactions } = useTransactions();
  const { station } = useStationSettings();
  const { summary } = useSummary();
  const [copied, setCopied] = useState(false);

  // Karta raqami
  const rawCardNumber =
    summary?.cardNumber ??
    profile?.card_number ??
    profile?.cardNumber ??
    null;

  // Balans
  const displayBalance = summary?.balance ?? profile?.cashback_balance ?? 0;

  // Ismni va familiyani tahrirlash
  const [showEditName, setShowEditName] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const openEditNameModal = () => {
    let fn = profile?.firstName || profile?.first_name || '';
    let ln = profile?.lastName || profile?.last_name || '';
    if (!fn && profile?.name) {
      const parts = profile.name.trim().split(' ');
      fn = parts[0] || '';
      ln = parts.slice(1).join(' ') || '';
    }
    setEditFirstName(fn);
    setEditLastName(ln);
    setShowEditName(true);
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!editFirstName.trim()) return;
    setSavingName(true);
    const res = await updateProfileName({
      firstName: editFirstName.trim(),
      lastName: editLastName.trim()
    });
    setSavingName(false);
    if (!res?.error) {
      setShowEditName(false);
      showToast('Ism va familiya muvaffaqiyatli yangilandi!', 'success');
    } else {
      showToast(res.error, 'error');
    }
  };

  // Modal holatlari
  const [activeModal, setActiveModal] = useState(null);

  // Xavfsizlik sozlamalari
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [biometricsEnabled, setBiometricsEnabled] = useState(
    localStorage.getItem('biometrics_enabled') === 'true'
  );

  // Bildirishnoma sozlamalari
  const [pushEnabled, setPushEnabled] = useState(
    localStorage.getItem('push_enabled') !== 'false'
  );
  const [smsEnabled, setSmsEnabled] = useState(
    localStorage.getItem('sms_enabled') === 'true'
  );

  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const thisMonthCashback = transactions
    .filter(t => {
      const d = new Date(t.created_at || t.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .filter(t => Number(t.cashback_amount ?? t.cashbackAmount) > 0 || (t.type || '').toLowerCase() === 'cashback' || (t.type || '').toUpperCase() === 'EARN')
    .reduce((s, t) => s + Number(t.cashback_amount ?? t.cashbackAmount ?? 0), 0);

  const copyCard = () => {
    if (!rawCardNumber) return;
    navigator.clipboard.writeText(rawCardNumber).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Parollar mos kelmadi!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast("Parol kamida 6 belgidan iborat bo'lishi kerak!", 'error');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Parol muvaffaqiyatli yangilandi!', 'success');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  const toggleBiometrics = () => {
    const nextState = !biometricsEnabled;
    setBiometricsEnabled(nextState);
    localStorage.setItem('biometrics_enabled', String(nextState));
    showToast(nextState ? 'Biometrika (Face ID / Touch ID) yoqildi' : "Biometrika o'chirildi", 'success');
  };

  const togglePush = () => {
    const nextState = !pushEnabled;
    setPushEnabled(nextState);
    localStorage.setItem('push_enabled', String(nextState));
    showToast(nextState ? 'Push bildirishnomalar yoqildi' : "Push bildirishnomalar o'chirildi", 'success');
  };

  const toggleSms = () => {
    const nextState = !smsEnabled;
    setSmsEnabled(nextState);
    localStorage.setItem('sms_enabled', String(nextState));
    showToast(nextState ? 'SMS bildirishnomalar yoqildi' : "SMS bildirishnomalar o'chirildi", 'success');
  };

  const showToast = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const totalEarnedCashback = transactions
    .filter(t => Number(t.cashback_amount ?? t.cashbackAmount) > 0 || (t.type || '').toLowerCase() === 'cashback' || (t.type || '').toUpperCase() === 'EARN')
    .reduce((s, t) => s + Number(t.cashback_amount ?? t.cashbackAmount ?? 0), 0);

  const getLevelInfo = () => {
    if (profile?.level && profile.level !== 'Standart') {
      const lvl = profile.level.toLowerCase();
      if (lvl.includes('vip')) return { name: profile.level, icon: FaCrown, color: 'text-purple-600 bg-purple-50 border-purple-200', iconColor: 'text-purple-600' };
      if (lvl.includes('oltin') || lvl.includes('gold')) return { name: profile.level, icon: FaTrophy, color: 'text-amber-500 bg-amber-50 border-amber-200', iconColor: 'text-amber-500' };
      if (lvl.includes('kumush') || lvl.includes('silver')) return { name: profile.level, icon: FaMedal, color: 'text-slate-600 bg-slate-100 border-slate-200', iconColor: 'text-slate-500' };
      return { name: profile.level, icon: FaShieldHalved, color: 'text-[#0f7b4c] bg-emerald-50 border-emerald-200', iconColor: 'text-[#0f7b4c]' };
    }
    const count = transactions.length;
    if (count >= 30 || totalEarnedCashback >= 500000) {
      return { name: 'VIP', icon: FaCrown, color: 'text-purple-600 bg-purple-50 border-purple-200', iconColor: 'text-purple-600' };
    }
    if (count >= 15 || totalEarnedCashback >= 200000) {
      return { name: 'Oltin', icon: FaTrophy, color: 'text-amber-500 bg-amber-50 border-amber-200', iconColor: 'text-amber-500' };
    }
    if (count >= 5 || totalEarnedCashback >= 50000) {
      return { name: 'Kumush', icon: FaMedal, color: 'text-slate-600 bg-slate-100 border-slate-200', iconColor: 'text-slate-500' };
    }
    return { name: 'Standart', icon: FaShieldHalved, color: 'text-[#0f7b4c] bg-emerald-50 border-emerald-200', iconColor: 'text-[#0f7b4c]' };
  };

  const levelInfo = getLevelInfo();
  const LevelIcon = levelInfo.icon;

  // Toggle switch komponenti
  const ToggleSwitch = ({ enabled, onToggle }) => (
    <button
      onClick={onToggle}
      className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ${enabled ? 'bg-[#0f7b4c]' : 'bg-gray-300'}`}
    >
      <div className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${enabled ? 'translate-x-5.5' : 'translate-x-0'}`} />
    </button>
  );

  const currentName = profile?.name ||
    [profile?.firstName || profile?.first_name, profile?.lastName || profile?.last_name].filter(Boolean).join(' ') ||
    '';

  return (
    <div className="flex-1 bg-[#F7F8FA] w-full font-sans pb-24 relative min-h-screen">

      {/* Toast xabar */}
      {message.text && (
        <div className={`fixed top-4 left-4 right-4 z-[500] px-4 py-3 rounded-2xl shadow-xl text-[13px] font-semibold transition-all text-center animate-slide-down ${
          message.type === 'success' ? 'bg-[#0f7b4c] text-white' : 'bg-red-600 text-white'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profil sarlavhasi */}
      <div className="bg-gradient-to-br from-[#0c613c] via-[#0f7b4c] to-[#14965d] pt-6 pb-12 px-5 text-white relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-white/8 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-6 top-16 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/30 shrink-0 backdrop-blur-md">
            <HiUserCircle size={48} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-[20px] font-extrabold truncate">
                {currentName || '—'}
              </h2>
              <button
                onClick={openEditNameModal}
                className="w-7 h-7 bg-white/15 hover:bg-white/25 rounded-lg flex items-center justify-center text-white/90 transition-all active:scale-95 shrink-0"
                title="Ism va familiyani o'zgartirish"
              >
                <HiPencilSquare size={16} />
              </button>
            </div>
            <p className="text-white/75 text-[13px] font-medium mt-0.5">
              {(() => {
                const raw = profile?.phone || user?.phone || user?.email || '';
                if (!raw) return '';
                const cleanDigits = raw.split('_')[0].split('@')[0].replace('+', '');
                return cleanDigits ? '+' + cleanDigits : '';
              })()}
            </p>
            <div className="flex items-center gap-1 mt-1 text-white/65 text-[12px]">
              <RiGasStationFill size={13} />
              <span>{station.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balans kartochkasi */}
      <div className="mx-4 -mt-6 bg-white rounded-[20px] p-5 relative z-10 border border-gray-100" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}>
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-gray-400 text-[12px] font-medium">Keshbek balansi</p>
            <h3 className="text-[28px] font-black text-[#1a1a1a] leading-none mt-1">
              {formatSum(displayBalance)}
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100 text-[#0f7b4c]">
            <HiWallet size={24} />
          </div>
        </div>

        {/* Karta — premium mini-karta dizayni */}
        <div
          className="relative rounded-2xl overflow-hidden p-4"
          style={{
            background: 'linear-gradient(135deg, #0c613c 0%, #0f7b4c 50%, #1aad6e 100%)',
          }}
        >
          {/* Orqa fon dekorativ doiralar */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/8 rounded-full pointer-events-none" />
          <div className="absolute -left-4 -bottom-6 w-20 h-20 bg-white/6 rounded-full pointer-events-none" />
          <div className="absolute right-10 bottom-2 w-12 h-12 bg-white/5 rounded-full pointer-events-none" />

          <div className="relative z-10">
            {/* Yuqori qism: chip + bank nomi */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {/* Chip */}
                <div className="w-8 h-6 bg-amber-300/90 rounded-md border border-amber-200/50" style={{
                  background: 'linear-gradient(135deg, #f6d860 0%, #e8b800 100%)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)'
                }} />
                <span className="text-white/70 text-[11px] font-semibold">KeshBak Card</span>
              </div>
              <HiCreditCard size={22} className="text-white/40" />
            </div>

            {/* Karta raqami */}
            <div className="mb-3">
              <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-1">Karta raqami</p>
              <p className="text-white font-mono font-bold tracking-[0.12em] text-[18px] leading-none">
                {rawCardNumber ? formatCardNumber(rawCardNumber) : '•••• ••••'}
              </p>
            </div>

            {/* Pastki qism: nusxalash tugmasi */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                <span className="text-white/60 text-[11px] font-medium">Faol</span>
              </div>
              {rawCardNumber && (
                <button
                  onClick={copyCard}
                  className={`flex items-center gap-1.5 text-[12px] font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
                    copied
                      ? 'bg-emerald-300/25 text-emerald-200 border border-emerald-300/30'
                      : 'bg-white/15 text-white/80 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <HiSquare2Stack size={14} />
                  {copied ? '✓ Nusxalandi' : 'Nusxa olish'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistika kartochalari — bir xil uslubda */}
      <div className="grid grid-cols-3 gap-2.5 mx-4 mt-4 mb-5">

        {/* Oylik keshbek — yashil */}
        <div className="bg-white rounded-[16px] p-3 flex flex-col items-center justify-center text-center border border-gray-100" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-2">
            <HiCalendarDays size={18} className="text-[#0f7b4c]" />
          </div>
          <p className="text-[12px] font-black text-gray-900 leading-snug">
            {formatSum(thisMonthCashback)}
          </p>
          <p className="text-gray-400 text-[10px] font-medium mt-0.5">Oylik keshbek</p>
        </div>

        {/* To'lovlar soni — ko'k */}
        <div className="bg-white rounded-[16px] p-3 flex flex-col items-center justify-center text-center border border-gray-100" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
          <div className="w-9 h-9 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-2">
            <HiReceiptPercent size={18} className="text-blue-500" />
          </div>
          <p className="text-[12px] font-black text-gray-900 leading-snug">
            {transactions.length} ta
          </p>
          <p className="text-gray-400 text-[10px] font-medium mt-0.5">To'lovlar</p>
        </div>

        {/* Daraja — darajaga qarab rangi o'zgaradi */}
        <div className="bg-white rounded-[16px] p-3 flex flex-col items-center justify-center text-center border border-gray-100" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center mb-2 border ${levelInfo.color}`}>
            <LevelIcon size={17} className={levelInfo.iconColor} />
          </div>
          <p className="text-[12px] font-black text-gray-900 leading-snug">
            {levelInfo.name}
          </p>
          <p className="text-gray-400 text-[10px] font-medium mt-0.5">Daraja</p>
        </div>

      </div>

      {/* Shaxobcha aloqa */}
      <div className="mx-4 mb-5 bg-white rounded-[20px] p-4 flex items-center justify-between border border-gray-100" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#f0f7f4] rounded-2xl flex items-center justify-center text-[#0f7b4c] shrink-0 border border-emerald-100">
            <RiGasStationFill size={20} />
          </div>
          <div>
            <p className="font-bold text-[14px] text-[#1a1a1a]">{station.name}</p>
            <p className="text-gray-400 text-[12px]">{station.phone}</p>
          </div>
        </div>
        <a href={`tel:${station.phone}`} className="w-9 h-9 bg-[#0f7b4c] rounded-2xl flex items-center justify-center shrink-0 text-white">
          <HiPhone size={17} />
        </a>
      </div>

      {/* --- SHAXSIY MA'LUMOT guruhi --- */}
      <div className="mx-4 mb-2">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2">
          Shaxsiy ma'lumot
        </p>
        <div className="bg-white rounded-[20px] border border-gray-100 overflow-hidden" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
          <button
            onClick={openEditNameModal}
            className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 bg-[#f0f7f4] rounded-2xl flex items-center justify-center text-[#0f7b4c] border border-emerald-100 shrink-0">
              <HiUserCircle size={19} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[14px] text-[#1a1a1a]">Ismni tahrirlash</p>
              <p className="text-gray-400 text-[12px] mt-0.5">Ism va familiyangizni yangilash</p>
            </div>
            <HiChevronRight size={16} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* --- SOZLAMALAR guruhi --- */}
      <div className="mx-4 mb-5">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest px-1 mb-2 mt-4">
          Sozlamalar
        </p>
        <div className="bg-white rounded-[20px] border border-gray-100 overflow-hidden" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>

          {/* Xavfsizlik */}
          <button
            onClick={() => setActiveModal('security')}
            className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-gray-50 border-b border-gray-100 transition-colors"
          >
            <div className="w-9 h-9 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100 shrink-0">
              <HiShieldCheck size={19} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[14px] text-[#1a1a1a]">Akkaunt Xavfsizligi</p>
              <p className="text-gray-400 text-[12px] mt-0.5">Raqam va hisob xavfsizligi</p>
            </div>
            <HiChevronRight size={16} className="text-gray-300" />
          </button>

          {/* Bildirishnomalar */}
          <button
            onClick={() => setActiveModal('notifications')}
            className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-gray-50 border-b border-gray-100 transition-colors"
          >
            <div className="w-9 h-9 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-100 shrink-0">
              <HiBell size={19} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[14px] text-[#1a1a1a]">Bildirishnomalar</p>
              <p className="text-gray-400 text-[12px] mt-0.5">Push va SMS sozlamalari</p>
            </div>
            <HiChevronRight size={16} className="text-gray-300" />
          </button>

          {/* Yordam */}
          <a
            href="https://t.me/musa_programmer"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-100 shrink-0">
              <HiQuestionMarkCircle size={19} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[14px] text-[#1a1a1a]">Yordam</p>
              <p className="text-gray-400 text-[12px] mt-0.5">Qo'llab-quvvatlash tizimi</p>
            </div>
            <HiChevronRight size={16} className="text-gray-300" />
          </a>

        </div>
      </div>

      {/* Chiqish tugmasi */}
      <div className="mx-4 mb-4">
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 font-bold text-[14px] active:bg-rose-100 transition-colors"
        >
          <HiArrowLeftOnRectangle size={19} />
          Tizimdan chiqish
        </button>
      </div>

      {/* ========== MODALLAR ========== */}

      {/* AKKAUNT XAVFSIZLIGI MODALI */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 active:scale-95 transition-all"
            >
              <HiXMark size={18} />
            </button>
            <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                <HiShieldCheck className="text-purple-600" size={18} />
              </div>
              Akkaunt Xavfsizligi
            </h3>

            <div className="flex flex-col gap-4">
              <div className="bg-[#F7F8FA] border border-gray-100 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-gray-400">Ulangan Telefon Raqam</span>
                  <span className="text-[11px] font-bold text-[#0f7b4c] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    Ulangan 🟢
                  </span>
                </div>
                <p className="font-extrabold text-[16px] text-gray-900">
                  {profile?.phone || '—'}
                </p>
              </div>

              <div className="bg-[#f0f7f4] border border-[#0f7b4c]/15 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0f7b4c]/10 text-[#0f7b4c] flex items-center justify-center shrink-0 mt-0.5">
                  <HiLockClosed size={17} />
                </div>
                <div>
                  <p className="font-bold text-[13px] text-gray-900">OTP Himoyasi</p>
                  <p className="text-gray-500 text-[12px] mt-0.5 leading-relaxed">
                    Sizning hisobingiz 4 xonali bir martalik kod (OTP) bilan to'liq himoyalangan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BILDIRISHNOMALAR MODALI */}
      {activeModal === 'notifications' && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 active:scale-95 transition-all"
            >
              <HiXMark size={18} />
            </button>
            <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-5 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <HiBell className="text-blue-500" size={18} />
              </div>
              Bildirishnomalar
            </h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-bold text-[14px] text-[#1a1a1a]">Push bildirishnomalar</p>
                  <p className="text-gray-400 text-[12px] mt-0.5">Keshbek kelganda bildirishnoma</p>
                </div>
                <ToggleSwitch enabled={pushEnabled} onToggle={togglePush} />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-bold text-[14px] text-[#1a1a1a]">SMS xabarnomalar</p>
                  <p className="text-gray-400 text-[12px] mt-0.5">SMS orqali bildirishnoma yuborish</p>
                </div>
                <ToggleSwitch enabled={smsEnabled} onToggle={toggleSms} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ISMNI TAHRIRLASH MODALI */}
      {showEditName && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-scale-up">
            <button
              onClick={() => setShowEditName(false)}
              className="absolute right-4 top-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 active:scale-95 transition-all"
            >
              <HiXMark size={18} />
            </button>

            <h3 className="text-[17px] font-bold text-[#1a1a1a] mb-4">
              Ism va familiyani o'zgartirish
            </h3>

            {/* Avvalgi ism ko'rsatish */}
            {currentName && (
              <div className="mb-4 p-3.5 bg-[#f0f7f4] border border-[#0f7b4c]/15 rounded-2xl">
                <p className="text-[11px] font-semibold text-gray-500 mb-1">Avvalgi ism va familiya:</p>
                <p className="text-[15px] font-bold text-[#1a1a1a]">{currentName}</p>
              </div>
            )}

            <form onSubmit={handleSaveName} className="flex flex-col gap-3">
              <div>
                <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">Yangi ism</label>
                <input
                  type="text"
                  value={editFirstName}
                  onChange={e => setEditFirstName(e.target.value)}
                  placeholder="Ismingiz"
                  required
                  className="w-full h-12 px-4 bg-[#F7F8FA] border border-gray-200 rounded-2xl text-[14px] font-bold text-gray-800 outline-none focus:border-[#0f7b4c] transition-colors"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-gray-500 mb-1.5 block">Yangi familiya</label>
                <input
                  type="text"
                  value={editLastName}
                  onChange={e => setEditLastName(e.target.value)}
                  placeholder="Familiyangiz (ixtiyoriy)"
                  className="w-full h-12 px-4 bg-[#F7F8FA] border border-gray-200 rounded-2xl text-[14px] font-bold text-gray-800 outline-none focus:border-[#0f7b4c] transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={savingName}
                className="w-full h-12 bg-[#0f7b4c] text-white font-bold text-[14px] rounded-2xl active:scale-95 transition-all mt-1 disabled:opacity-60"
                style={{ boxShadow: '0px 4px 12px rgba(15,123,76,0.25)' }}
              >
                {savingName ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
