import React, { useState } from 'react';
import {
  HiMiniArrowDownLeft,
  HiMiniArrowUpRight,
  HiWallet,
  HiClock,
  HiTag,
  HiShoppingCart,
  HiXMark,
  HiReceiptRefund,
  HiCalendarDays,
} from 'react-icons/hi2';
import { RiGasStationFill } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useStationSettings } from '../hooks/useStationSettings';
import { useSummary } from '../hooks/useSummary';

const formatSum = (n) => Number(Math.abs(n) || 0).toLocaleString('uz-UZ') + " so'm";

const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());

  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return `Bugun, ${hour}:${minute}`;
  if (isYesterday) return `Kecha, ${hour}:${minute}`;
  return `${day}.${month}.${year} ${hour}:${minute}`;
};

// Skeleton loader
const SkeletonCard = () => (
  <div className="bg-white rounded-[16px] p-4 flex items-center gap-3.5 border border-gray-100">
    <div className="skeleton w-11 h-11 rounded-2xl shrink-0" />
    <div className="flex-1">
      <div className="skeleton h-3.5 w-32 mb-2 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
    <div className="text-right">
      <div className="skeleton h-3.5 w-16 mb-2 rounded" />
      <div className="skeleton h-3 w-20 rounded" />
    </div>
  </div>
);

// Tranzaksiya batafsil modali
const TxDetailModal = ({ item, station, onClose }) => {
  if (!item) return null;
  const isChiqim =
    Number(item.cashback_amount ?? item.cashbackAmount) < 0 ||
    (item.type || '').toLowerCase() === 'withdraw' ||
    (item.type || '').toUpperCase() === 'WITHDRAW';

  const cashbackVal = Math.abs(Number(item.cashback_amount ?? item.cashbackAmount ?? 0));
  const paymentVal = Math.abs(Number(item.amount ?? item.totalAmount ?? 0));

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-10 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        {/* Sarlavha */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[17px] font-bold text-[#1a1a1a]">Amal tafsiloti</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-700 active:scale-95 transition-all"
          >
            <HiXMark size={18} />
          </button>
        </div>

        {/* Asosiy summa */}
        <div className={`rounded-2xl p-4 mb-4 flex items-center justify-between ${
          isChiqim ? 'bg-rose-50 border border-rose-100' : 'bg-emerald-50 border border-emerald-100'
        }`}>
          <div>
            <p className={`text-[12px] font-semibold mb-1 ${isChiqim ? 'text-rose-500' : 'text-[#0f7b4c]'}`}>
              {isChiqim ? 'Keshbek ishlatildi' : 'Keshbek yig\'ildi'}
            </p>
            <p className={`text-[28px] font-black leading-none ${isChiqim ? 'text-rose-600' : 'text-[#0f7b4c]'}`}>
              {isChiqim ? `- ${formatSum(cashbackVal)}` : `+ ${formatSum(cashbackVal)}`}
            </p>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
            isChiqim ? 'bg-rose-100 text-rose-500 border-rose-200' : 'bg-emerald-100 text-[#0f7b4c] border-emerald-200'
          }`}>
            {isChiqim ? <HiMiniArrowUpRight size={26} /> : <HiMiniArrowDownLeft size={26} />}
          </div>
        </div>

        {/* Tafsilotlar ro'yxati */}
        <div className="flex flex-col gap-3">
          {/* Shaxobcha */}
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-500">
              <RiGasStationFill size={16} className="text-[#0f7b4c]" />
              <span className="text-[13px] font-medium">Shaxobcha</span>
            </div>
            <span className="text-[13px] font-bold text-[#1a1a1a]">
              {item.station_name || station.name}
            </span>
          </div>

          {/* To'lov summasi */}
          {paymentVal > 0 && (
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-500">
                <HiReceiptRefund size={16} className="text-blue-500" />
                <span className="text-[13px] font-medium">To'lov summasi</span>
              </div>
              <span className="text-[13px] font-bold text-[#1a1a1a]">{formatSum(paymentVal)}</span>
            </div>
          )}

          {/* Sana va vaqt */}
          <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-500">
              <HiCalendarDays size={16} className="text-purple-500" />
              <span className="text-[13px] font-medium">Sana va vaqt</span>
            </div>
            <span className="text-[13px] font-bold text-[#1a1a1a]">
              {formatDate(item.created_at || item.createdAt)}
            </span>
          </div>

          {/* Yoqilg'i turi (agar mavjud) */}
          {item.fuel_type && (
            <div className="flex items-center justify-between py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-500">
                <HiTag size={16} className="text-amber-500" />
                <span className="text-[13px] font-medium">Yoqilg'i turi</span>
              </div>
              <span className="text-[13px] font-bold text-[#1a1a1a]">{item.fuel_type}</span>
            </div>
          )}

          {/* Amal turi */}
          <div className="flex items-center justify-between py-2.5">
            <div className="flex items-center gap-2 text-gray-500">
              <HiShoppingCart size={16} className="text-gray-400" />
              <span className="text-[13px] font-medium">Amal turi</span>
            </div>
            <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full ${
              isChiqim ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-[#0f7b4c]'
            }`}>
              {isChiqim ? 'Chiqim' : 'Kirim'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoryPage = () => {
  const { user, profile } = useAuth();
  const { transactions, loading, hasMore, loadMore } = useTransactions();
  const { station }                = useStationSettings();
  const { summary }               = useSummary();
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'KIRIM' | 'CHIQIM'
  const [selectedTx, setSelectedTx]   = useState(null);

  // Faqat haqiqiy pul tushgan yoki yechilgan tranzaksiyalar
  const validTransactions = transactions.filter(
    (t) => Math.abs(Number(t.amount ?? t.totalAmount ?? 0)) > 0 || Math.abs(Number(t.cashback_amount ?? t.cashbackAmount ?? 0)) > 0
  );

  const kirimTransactions = validTransactions.filter(
    (t) => Number(t.cashback_amount ?? t.cashbackAmount) > 0 || (t.type || '').toLowerCase() === 'cashback' || (t.type || '').toUpperCase() === 'EARN'
  );

  const chiqimTransactions = validTransactions.filter(
    (t) => Number(t.cashback_amount ?? t.cashbackAmount) < 0 || (t.type || '').toLowerCase() === 'withdraw' || (t.type || '').toUpperCase() === 'WITHDRAW'
  );

  const localKirim  = kirimTransactions.reduce((s, t)  => s + Number(t.cashback_amount ?? t.cashbackAmount ?? 0), 0);
  const localChiqim = chiqimTransactions.reduce((s, t) => s + Math.abs(Number(t.cashback_amount ?? t.cashbackAmount ?? 0)), 0);

  const displayBalance       = summary?.balance         ?? profile?.cashbackBalance ?? profile?.cashback_balance ?? Math.max(0, localKirim - localChiqim);
  const displayTotalEarned   = summary?.totalEarned     ?? localKirim;
  const displayTotalSpent    = summary?.totalSpent      ?? localChiqim;
  const displayTotalPurchase = summary?.totalPurchase   ?? 0;

  const filteredList = validTransactions.filter((t) => {
    const isChiqim = Number(t.cashback_amount ?? t.cashbackAmount) < 0 || (t.type || '').toLowerCase() === 'withdraw' || (t.type || '').toUpperCase() === 'WITHDRAW';
    if (activeTab === 'KIRIM') return !isChiqim;
    if (activeTab === 'CHIQIM') return isChiqim;
    return true;
  });

  return (
    <div className="flex-1 bg-[#F7F8FA] w-full pb-24 min-h-screen">

      {/* Tranzaksiya batafsil modal */}
      {selectedTx && (
        <TxDetailModal item={selectedTx} station={station} onClose={() => setSelectedTx(null)} />
      )}

      {/* Umumiy Natija Kartasi */}
      <div className="mx-4 mt-4 mb-4 bg-gradient-to-br from-[#0c613c] via-[#0f7b4c] to-[#14965d] rounded-[20px] p-5 text-white shadow-lg shadow-[#0f7b4c]/25 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/8 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-12 -top-8 w-24 h-24 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-100 text-[11px] font-bold uppercase tracking-widest bg-white/12 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
              Jami keshbek balansi
            </span>
            <span className="text-white/60 text-[11px] font-medium">
              {validTransactions.length} ta amal
            </span>
          </div>

          <h2 className="text-[32px] font-black leading-none my-3 tracking-tight">
            {formatSum(displayBalance)}
          </h2>

          {/* Kirim va Chiqim statistikasi */}
          <div className="grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 text-emerald-200 text-[11px] font-semibold mb-1.5">
                <HiMiniArrowDownLeft className="text-emerald-300" size={15} />
                Jami kirim
              </div>
              <p className="font-black text-[15px] text-white">+ {formatSum(displayTotalEarned)}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="flex items-center gap-1.5 text-rose-200 text-[11px] font-semibold mb-1.5">
                <HiMiniArrowUpRight className="text-rose-300" size={15} />
                Jami chiqim
              </div>
              <p className="font-black text-[15px] text-white">- {formatSum(displayTotalSpent)}</p>
            </div>

            {displayTotalPurchase > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 col-span-2">
                <div className="flex items-center gap-1.5 text-amber-200 text-[11px] font-semibold mb-1.5">
                  <HiShoppingCart className="text-amber-300" size={14} />
                  Umumiy xarajat
                </div>
                <p className="font-black text-[15px] text-white">{formatSum(displayTotalPurchase)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filtr Tablari */}
      <div className="px-4 mb-4">
        <div className="bg-gray-200/60 p-1 rounded-2xl flex items-center gap-1">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 ${
              activeTab === 'ALL'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Barchasi ({validTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab('KIRIM')}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
              activeTab === 'KIRIM'
                ? 'bg-[#0f7b4c] text-white shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <HiMiniArrowDownLeft size={14} />
            Kirim ({kirimTransactions.length})
          </button>
          <button
            onClick={() => setActiveTab('CHIQIM')}
            className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold transition-all duration-200 flex items-center justify-center gap-1 ${
              activeTab === 'CHIQIM'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-500'
            }`}
          >
            <HiMiniArrowUpRight size={14} />
            Chiqim ({chiqimTransactions.length})
          </button>
        </div>
      </div>

      {/* Shaxobcha ma'lumoti */}
      <div className="flex items-center justify-between px-5 mb-3">
        <div className="flex items-center gap-2">
          <RiGasStationFill size={15} className="text-[#0f7b4c]" />
          <p className="text-[12px] text-gray-500 font-semibold">{station.name}</p>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-medium text-gray-400">
          <HiClock size={13} />
          Tarix
        </div>
      </div>

      {/* Skeleton loading */}
      {loading && transactions.length === 0 && (
        <div className="flex flex-col gap-2.5 px-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Bo'sh holat */}
      {!loading && transactions.length === 0 && (
        <div className="mx-4 bg-white rounded-[20px] p-10 text-center border border-gray-100 my-4" style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}>
          <div className="w-16 h-16 bg-[#f0f7f4] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <HiWallet size={28} className="text-[#0f7b4c]" />
          </div>
          <h4 className="font-bold text-gray-800 text-[15px] mb-1.5">
            {activeTab === 'KIRIM'
              ? "Kirim keshbeklar yo'q"
              : activeTab === 'CHIQIM'
              ? "Chiqim amallari yo'q"
              : "Hali to'lovlar tarixi yo'q"}
          </h4>
          <p className="text-gray-400 text-[13px] max-w-xs mx-auto leading-relaxed">
            Zapravkada QR-kodni skanerlang va keshbekingizni yig'ing yoki ishlating!
          </p>
        </div>
      )}

      {/* Operatsiyalar ro'yxati */}
      {filteredList.length > 0 && (
        <div className="flex flex-col gap-2.5 px-4 pb-6">
          {filteredList.map((item, index) => {
            const isChiqim =
              Number(item.cashback_amount ?? item.cashbackAmount) < 0 ||
              (item.type || '').toLowerCase() === 'withdraw' ||
              (item.type || '').toUpperCase() === 'WITHDRAW';

            const cashbackVal = Math.abs(Number(item.cashback_amount ?? item.cashbackAmount ?? 0));
            const paymentVal = Math.abs(Number(item.amount ?? item.totalAmount ?? 0));

            return (
              <button
                key={item.id || index}
                onClick={() => setSelectedTx(item)}
                className="bg-white rounded-[16px] p-4 flex items-center justify-between border border-gray-100 text-left w-full active:scale-[0.99] transition-transform"
                style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}
              >
                {/* Chap taraf */}
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isChiqim
                      ? 'bg-rose-50 text-rose-500 border border-rose-100'
                      : 'bg-emerald-50 text-[#0f7b4c] border border-emerald-100'
                  }`}>
                    {isChiqim ? <HiMiniArrowUpRight size={19} /> : <HiMiniArrowDownLeft size={19} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-[13px] text-gray-900">
                        {isChiqim ? 'Keshbek ishlatildi' : "Keshbek yig'ildi"}
                      </p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isChiqim ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-[#0f7b4c]'
                      }`}>
                        {isChiqim ? 'Chiqim' : 'Kirim'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-[12px] mt-0.5">
                      {formatDate(item.created_at || item.createdAt)}
                    </p>
                  </div>
                </div>

                {/* O'ng taraf */}
                <div className="text-right">
                  {paymentVal > 0 && (
                    <p className="text-gray-400 text-[11px] font-medium">
                      To'lov: {formatSum(paymentVal)}
                    </p>
                  )}
                  <p className={`font-black text-[14px] mt-0.5 ${isChiqim ? 'text-rose-500' : 'text-[#0f7b4c]'}`}>
                    {isChiqim ? `- ${formatSum(cashbackVal)}` : `+ ${formatSum(cashbackVal)}`}
                  </p>
                </div>
              </button>
            );
          })}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={loading}
              className="mt-2 w-full py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-2xl text-[14px] hover:bg-gray-50 transition-colors flex items-center justify-center"
              style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.05)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              ) : (
                "Ko'proq yuklash"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
