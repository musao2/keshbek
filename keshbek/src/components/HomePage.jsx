import React, { useState } from 'react';
import { HiSparkles, HiQrCode, HiMiniArrowDownLeft, HiMiniArrowUpRight } from 'react-icons/hi2';
import { RiGasStationFill } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../hooks/useTransactions';
import { useStationSettings } from '../hooks/useStationSettings';
import { useSummary } from '../hooks/useSummary';
import QRScanner from './QRScanner';

import { formatSum } from '../utils/formatters';
import SkeletonTxCard from './common/SkeletonTxCard';
import TransactionListItem from './common/TransactionListItem';

const HomePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { transactions, addTransaction, loading: txLoading } = useTransactions();
  const { station } = useStationSettings();
  const { summary, error: summaryError, refetch: refetchSummary } = useSummary();
  const [showScanner, setShowScanner] = useState(false);
  const [scanMsg, setScanMsg] = useState('');
  const [qrTapped, setQrTapped] = useState(false);

  // Summary dan olingan yoki profile fallback
  const displayBalance       = summary?.balance         ?? profile?.cashbackBalance ?? profile?.cashback_balance ?? 0;
  const displayCashbackPct   = summary?.cashbackPercent ?? station.cashback_percent  ?? 0;
  const displayTotalEarned   = summary?.totalEarned     ?? 0;
  const displayTotalSpent    = summary?.totalSpent      ?? 0;
  const displayTotalPurchase = summary?.totalPurchase   ?? 0;

  // Faqat haqiqiy pul tushgan yoki yechilgan tranzaksiyalar
  const validTransactions = transactions.filter(
    (t) => Math.abs(Number(t.amount ?? t.totalAmount ?? 0)) > 0 || Math.abs(Number(t.cashback_amount ?? t.cashbackAmount ?? 0)) > 0
  );
  const recentTx = validTransactions.slice(0, 3);

  const handleQrClick = () => {
    setQrTapped(true);
    setTimeout(() => {
      setQrTapped(false);
      setShowScanner(true);
    }, 200);
  };

  const handleScan = async (qrData) => {
    setShowScanner(false);
    if (!qrData) {
      setScanMsg('❌ Yaroqsiz QR-kod!');
      setTimeout(() => setScanMsg(''), 3500);
      return;
    }
    setScanMsg('Yuklanmoqda...');
    const { data, error } = await addTransaction(qrData);
    if (error) {
      setScanMsg('❌ Xatolik: ' + error);
    } else {
      const amountMsg = data?.cashbackAmount || data?.cashback_amount || data?.amount || data?.transaction?.cashback_amount || '';
      const type = data?.type || data?.transaction?.type || '';
      if (type.toLowerCase() === 'withdraw') {
        setScanMsg(`✅ Keshbek yechib olindi! ${amountMsg ? formatSum(Math.abs(amountMsg)) : ''}`);
      } else {
        setScanMsg(`✅ Keshbek yig'ildi! ${amountMsg ? '+' + formatSum(Math.abs(amountMsg)) : ''}`);
      }
      await refreshProfile();
      await refetchSummary();
    }
    setTimeout(() => setScanMsg(''), 3500);
  };

  // Foydalanuvchi ismi
  const userName = profile?.name ||
    [profile?.firstName || profile?.first_name, profile?.lastName || profile?.last_name].filter(Boolean).join(' ') ||
    'Foydalanuvchi';

  return (
    <>
      {showScanner && (
        <QRScanner onClose={() => setShowScanner(false)} onScan={handleScan} />
      )}

      <div className="flex-1 bg-[#F7F8FA] pb-8 w-full">

        {/* Scan xabari */}
        {scanMsg && (
          <div className={`mx-4 mt-4 px-4 py-3 rounded-2xl text-[14px] font-semibold text-center animate-slide-down ${
            scanMsg.startsWith('✅') ? 'bg-emerald-50 text-[#0f7b4c] border border-emerald-200' : 'bg-red-50 text-red-500 border border-red-200'
          }`}>
            {scanMsg}
          </div>
        )}

        {summaryError && (
          <div className="mx-4 mt-4 px-4 py-3 rounded-2xl text-[14px] font-semibold text-center bg-red-50 text-red-500 border border-red-200">
            ⚠️ Internet aloqasi yo'q yoki server javob bermayapti. Qayta urinib ko'ring.
          </div>
        )}

        {/* Balans kartasi — Hero */}
        <div className="mx-4 mt-5 bg-gradient-to-br from-[#0c613c] via-[#0f7b4c] to-[#14965d] rounded-[20px] p-5 text-white mb-4 shadow-lg shadow-[#0f7b4c]/25 relative overflow-hidden border border-white/10">
          {/* Dekorativ elementlar */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/8 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -top-8 w-28 h-28 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />

          {/* Salomlashuv — kichik va xira */}
          <div className="relative z-10 mb-4">
            <p className="text-emerald-200/75 text-[13px] font-medium flex items-center gap-1">
              <HiSparkles size={13} className="text-amber-300" />
              Xush kelibsiz, {userName} 👋
            </p>
          </div>

          {/* Balans — katta va aniq */}
          <div className="relative z-10">
            <p className="text-emerald-100/70 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
              Keshbek balansi
            </p>
            <h2 className="text-[36px] font-black leading-none mb-3 tracking-tight">
              {formatSum(displayBalance)}
            </h2>

            {/* Kirim / Chiqim mini statistika */}
            {(displayTotalEarned > 0 || displayTotalSpent > 0) && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1 bg-white/12 backdrop-blur-md px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-emerald-100 border border-white/10">
                  <HiMiniArrowDownLeft size={12} className="text-emerald-300" />
                  +{formatSum(displayTotalEarned)}
                </div>
                <div className="flex items-center gap-1 bg-white/12 backdrop-blur-md px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-rose-100 border border-white/10">
                  <HiMiniArrowUpRight size={12} className="text-rose-300" />
                  -{formatSum(displayTotalSpent)}
                </div>
              </div>
            )}

            {/* Pastki badge va shaxobcha */}
            <div className="flex items-center justify-between pt-3 border-t border-white/15">
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full text-[12px] font-bold text-emerald-50 border border-white/15">
                <HiSparkles size={13} className="text-amber-300" />
                <span>{displayCashbackPct}% keshbek</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-100/80 text-[12px] font-medium">
                <RiGasStationFill size={14} />
                <span>{station.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* QR Skanerlash tugmasi — animatsiya bilan */}
        <div
          onClick={handleQrClick}
          className={`mx-4 bg-gradient-to-br from-[#0bd39a] to-[#09b382] rounded-[20px] h-[128px] flex flex-col items-center justify-center cursor-pointer mb-4 shadow-md shadow-[#0bd39a]/25 border border-[#09b382]/30 transition-all duration-200 select-none ${
            qrTapped ? 'scale-[0.97]' : 'active:scale-[0.97] hover:shadow-lg hover:shadow-[#0bd39a]/30'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <div className={`bg-white/25 w-14 h-14 rounded-full flex items-center justify-center text-[#03543d] mb-2 border border-white/30 transition-transform duration-200 ${qrTapped ? 'scale-110' : ''}`}>
            <HiQrCode size={30} />
          </div>
          <span className="text-[#03543d] font-bold text-[15px]">QR skanerlash</span>
          <span className="text-[#03543d]/65 text-[12px] mt-0.5">To'lov uchun skanerlang</span>
        </div>

        {/* Aksiya banneri */}
        <div className="mx-4 bg-gradient-to-r from-[#fff4eb] to-[#fff8f2] rounded-[20px] p-4 mb-5 flex items-center gap-4 border border-[#fcd3b0]/60 shadow-sm">
          <div className="w-12 h-12 bg-[#f6d0b3] rounded-2xl flex items-center justify-center text-[#965b20] shrink-0 border border-[#fcd3b0]">
            <RiGasStationFill size={22} />
          </div>
          <div>
            <p className="text-[#965b20] font-bold text-[12px] uppercase tracking-wide">Maxsus taklif</p>
            <p className="text-[#1a1a1a] font-bold text-[14px] leading-snug mt-0.5">
              Har to'lovdan <span className="text-[#0f7b4c]">{displayCashbackPct}% keshbek</span> yig'asiz
            </p>
          </div>
        </div>

        {/* Oxirgi tranzaksiyalar */}
        <div className="flex justify-between items-center mb-3 px-4">
          <h3 className="text-[15px] font-bold text-[#1a1a1a]">Oxirgi to'lovlar</h3>
          <span className="text-[13px] text-[#0f7b4c] font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            {validTransactions.length} ta jami
          </span>
        </div>

        {/* Skeleton loading */}
        {txLoading && transactions.length === 0 && (
          <div className="flex flex-col gap-3 px-4">
            <SkeletonTxCard />
            <SkeletonTxCard />
            <SkeletonTxCard />
          </div>
        )}

        {/* Bo'sh holat */}
        {!txLoading && recentTx.length === 0 && (
          <div className="mx-4 bg-white rounded-[20px] p-8 text-center border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-[#f0f7f4] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
              <HiQrCode size={30} className="text-[#0f7b4c]" />
            </div>
            <h4 className="font-bold text-gray-800 text-[15px] mb-1.5">Hali to'lovlar yo'q</h4>
            <p className="text-gray-400 text-[13px] leading-relaxed">
              Zapravkada QR-kodni skanerlang va keshbeklaringizni yig'ing!
            </p>
          </div>
        )}

        {/* Tranzaksiya ro'yxati */}
        {recentTx.length > 0 && (
          <div className="flex flex-col gap-2.5 px-4">
            {recentTx.map((item) => (
              <TransactionListItem 
                key={item.id} 
                item={item} 
                defaultStationName={station.name} 
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default HomePage;
