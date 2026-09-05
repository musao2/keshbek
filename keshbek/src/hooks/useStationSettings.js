import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const DEFAULT_STATION = {
  name: 'Lukoil — Yunusobod',
  address: 'Yunusobod tumani, 14-mavze, 7-uy',
  phone: '+998 71 234 56 78',
  work_hours: 'Har kuni: 07:00 – 23:00',
  cashback_percent: 5.0,
  rating: 4.8,
  fuel_types: ['AI-80', 'AI-91', 'AI-95', 'Dizel'],
  is_open: true,
  lat: 41.3653226,
  lng: 69.2870051,
};

/**
 * Backend dan stansiya sozlamalarini oladi.
 * API javob formatlari: { data: {...} }, { station: {...} }, yoki to'g'ridan-to'g'ri obyekt
 */
export const useStationSettings = () => {
  const [station, setStation] = useState(DEFAULT_STATION);
  const [loading, setLoading] = useState(true);

  const fetchStationSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/station');

      // Turli response strukturalarini qo'llab-quvvatlash
      let data = response?.data?.station   // { data: { station: {...} } }
             || response?.data             // { data: {...} }
             || response?.station          // { station: {...} }
             || response;                  // to'g'ridan-to'g'ri obyekt

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // fuel_types string bo'lib kelsa arrayga o'tkazamiz
        if (typeof data.fuel_types === 'string') {
          data = { ...data, fuel_types: data.fuel_types.split(',').map(s => s.trim()) };
        }
        setStation(prev => ({ ...DEFAULT_STATION, ...prev, ...data }));
      }
    } catch (e) {
      // Tarmoq xatosi bo'lsa default qiymatlar qoladi
      // console.error('Station settings xatosi:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationSettings();
  }, []);

  return { station, loading, refetch: fetchStationSettings };
};
