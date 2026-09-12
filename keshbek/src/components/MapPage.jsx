import React from 'react';
import {
  IoLocationOutline,
  IoCallOutline,
  IoTimeOutline,
  IoNavigateOutline,
  IoMapOutline,
} from 'react-icons/io5';
import { BsFuelPump } from 'react-icons/bs';
import { HiStar } from 'react-icons/hi2';
import { useStationSettings } from '../hooks/useStationSettings';
import CustomerReviews from './CustomerReviews';

const MapPage = () => {
  const { station } = useStationSettings();

  const isOpen      = station.isOpen      ?? station.is_open       ?? true;
  const cashbackPct = station.cashbackPercent ?? station.cashback_percent ?? 0;
  const workHours   = station.workHours   || station.work_hours   || '';
  const fuelTypes   = station.fuelTypes   || station.fuel_types   || [];
  const rating      = station.rating ?? 5;
  const reviewCount = station.reviewCount ?? station.review_count ?? 0;

  const lat = station.lat || 41.3253226;
  const lng = station.lng || 69.2870051;

  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005}%2C${lat - 0.003}%2C${lng + 0.005}%2C${lat + 0.003}&layer=mapnik&marker=${lat}%2C${lng}`;

  const handleOpenNavigation = () => {
    const yandexUrl = `https://yandex.com/maps/?rtext=~${lat},${lng}&rtt=auto`;
    window.open(yandexUrl, '_blank');
  };

  // Reyting yulduzlarini render qilish
  const renderStars = (r) => {
    const full = Math.floor(r);
    return Array.from({ length: 5 }, (_, i) => (
      <HiStar
        key={i}
        size={14}
        className={i < full ? 'text-amber-400' : 'text-gray-200'}
      />
    ));
  };

  return (
    <div className="flex-1 bg-[#F7F8FA] w-full font-sans flex flex-col pb-10">

      {/* Real Interaktiv Xarita */}
      <div className="relative mx-4 mt-5 rounded-[20px] overflow-hidden border border-gray-200" style={{ height: 230, boxShadow: '0px 4px 12px rgba(0,0,0,0.08)' }}>
        <iframe
          title="Stansiya joylashuvi"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src={osmEmbedUrl}
          className="w-full h-full"
        />

        {/* Shaxobcha nomi — oq fon + shadow */}
        <div className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-xl flex items-center gap-1.5" style={{ boxShadow: '0px 2px 10px rgba(0,0,0,0.15)' }}>
          <BsFuelPump size={15} className="text-[#0f7b4c]" />
          <span className="text-[12px] font-bold text-[#1a1a1a]">{station.name}</span>
        </div>

        {/* Xaritada ochish tugmasi */}
        <button
          onClick={handleOpenNavigation}
          className="absolute bottom-3 right-3 bg-[#0f7b4c] text-white font-bold text-[11px] px-3 py-1.5 rounded-xl flex items-center gap-1 active:scale-95 transition-all"
          style={{ boxShadow: '0px 2px 8px rgba(15,123,76,0.35)' }}
        >
          <IoMapOutline size={14} />
          Yandex Xaritada ochish
        </button>
      </div>

      {/* Shaxobcha kartasi */}
      <div className={`mx-4 mt-4 bg-white rounded-[20px] overflow-hidden transition-all ${
        isOpen
          ? 'border border-[#0f7b4c]/30'
          : 'border border-red-400/40'
      }`} style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}>
        {/* Status rangli chiziq */}
        <div className={`h-1 ${isOpen ? 'bg-gradient-to-r from-[#0f7b4c] to-[#14965d]' : 'bg-red-500'}`} />

        <div className="p-4">
          {/* Nomi va holat badge */}
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 pr-2">
              <h3 className="font-extrabold text-[18px] text-[#1a1a1a] leading-tight">{station.name}</h3>
              {station.address ? (
                <div className="flex items-start gap-1 mt-1 text-gray-500 text-[12px]">
                  <IoLocationOutline size={14} className="text-[#0f7b4c] mt-0.5 shrink-0" />
                  <span className="leading-snug">{station.address}</span>
                </div>
              ) : null}
            </div>
            <span className={`text-[12px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
              isOpen
                ? 'bg-emerald-50 text-[#0f7b4c] border border-emerald-200'
                : 'bg-red-100 text-red-600 border border-red-200'
            }`}>
              {isOpen ? '● Ochiq' : '● Yopiq'}
            </span>
          </div>

          {/* Ma'lumotlar */}
          <div className="flex flex-col gap-2.5 mb-4">
            {station.phone ? (
              <div className="flex items-center gap-2.5 text-[13px] text-gray-600">
                <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center border border-blue-100">
                  <IoCallOutline size={14} className="text-blue-500" />
                </div>
                <span className="font-medium">{station.phone}</span>
              </div>
            ) : null}
            {workHours ? (
              <div className="flex items-center gap-2.5 text-[13px] text-gray-600">
                <div className="w-7 h-7 bg-purple-50 rounded-lg flex items-center justify-center border border-purple-100">
                  <IoTimeOutline size={14} className="text-purple-500" />
                </div>
                <span className="font-medium">{workHours}</span>
              </div>
            ) : null}

            {/* Reyting — yangi format: ⭐ 5.0 (124 ta sharh) */}
            <div className="flex items-center gap-2.5 text-[13px] text-gray-600">
              <div className="w-7 h-7 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                <HiStar size={14} className="text-amber-400" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {renderStars(rating)}
                </div>
                <span className="font-bold text-[#1a1a1a]">{Number(rating).toFixed(1)}</span>
                {reviewCount > 0 && (
                  <span className="text-gray-400 text-[12px]">({reviewCount} ta sharh)</span>
                )}
              </div>
            </div>
          </div>

          {/* Keshbek foizi va yoqilg'i turlari */}
          <div className="bg-[#f0f7f4] rounded-2xl p-3.5 flex items-center justify-between mb-4 border border-emerald-100">
            <div>
              <p className="text-[11px] text-gray-500 font-medium">Keshbek foizi</p>
              <p className="text-[26px] font-black text-[#0f7b4c] leading-tight">{cashbackPct}%</p>
            </div>
            {fuelTypes.length > 0 && (
              <div className="text-right">
                <p className="text-[11px] text-gray-500 font-medium mb-1.5">Yoqilg'i turlari</p>
                <div className="flex flex-wrap gap-1 justify-end">
                  {fuelTypes.map(f => (
                    <span key={f} className="bg-white text-gray-700 text-[11px] px-2 py-0.5 rounded-full border border-gray-200 font-semibold">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tugmalar — bir xil balandlik, aniq ierarxiya */}
          <div className="flex gap-2.5">
            {station.phone ? (
              <a
                href={`tel:${station.phone}`}
                className="flex-1 flex items-center justify-center gap-2 h-12 bg-white border-2 border-gray-200 rounded-2xl text-[14px] text-gray-700 font-bold active:scale-95 transition-all hover:border-gray-300"
              >
                <IoCallOutline size={17} />
                Qo'ng'iroq
              </a>
            ) : null}
            <button
              onClick={handleOpenNavigation}
              className={`${station.phone ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 h-12 bg-[#0f7b4c] rounded-2xl text-[14px] text-white font-bold active:scale-95 transition-all`}
              style={{ boxShadow: '0px 4px 12px rgba(15,123,76,0.3)' }}
            >
              <IoNavigateOutline size={17} />
              Yo'l ko'rsatish
            </button>
          </div>
        </div>
      </div>

      {/* Mijozlar fikrlari */}
      <CustomerReviews />

    </div>
  );
};

export default MapPage;
