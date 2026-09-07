import { useState, useEffect } from 'react';
import { api } from '../lib/api';

const DEFAULT_STATION = {
  name: 'Zapravka Stansiyasi',
  address: '',
  phone: '',
  work_hours: '',
  workHours: '',
  cashback_percent: 9,
  cashbackPercent: 9,
  rating: 5,
  fuel_types: ['AI-80', 'AI-91', 'AI-95'],
  fuelTypes: ['AI-80', 'AI-91', 'AI-95'],
  is_open: true,
  isOpen: true,
  lat: 41.3253226,
  lng: 69.2870051,
};

/**
 * Backend dan stansiya sozlamalarini oladi.
 * API camelCase qaytaradi: isOpen, cashbackPercent, fuelTypes, workHours
 * Ikkala formatni ham eksport qiladi (snake_case va camelCase)
 */
export const useStationSettings = () => {
  const [station, setStation] = useState(DEFAULT_STATION);
  const [loading, setLoading] = useState(true);

  const fetchStationSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/station');

      // API { success: true, data: {...} } ko'rinishida qaytaradi
      let raw = response?.data?.station
             || response?.data
             || response?.station
             || response;

      if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
        // fuel_types yoki fuelTypes — ikkalasini ham qo'llab-quvvatlaymiz
        const fuelArr = raw.fuelTypes || raw.fuel_types || [];
        const fuelTypes = Array.isArray(fuelArr)
          ? fuelArr
          : typeof fuelArr === 'string'
            ? fuelArr.split(',').map(s => s.trim())
            : DEFAULT_STATION.fuelTypes;

        // isOpen yoki is_open
        const isOpen = raw.isOpen ?? raw.is_open ?? DEFAULT_STATION.isOpen;

        // cashbackPercent yoki cashback_percent
        const cashbackPercent = raw.cashbackPercent ?? raw.cashback_percent ?? DEFAULT_STATION.cashbackPercent;

        // workHours yoki work_hours
        const workHours = raw.workHours || raw.work_hours || DEFAULT_STATION.work_hours;

        const normalized = {
          ...DEFAULT_STATION,
          ...raw,
          // Normalize — ikkalasini ham set qilamiz
          fuelTypes,
          fuel_types: fuelTypes,
          isOpen,
          is_open: isOpen,
          cashbackPercent,
          cashback_percent: cashbackPercent,
          workHours,
          work_hours: workHours,
        };

        setStation(normalized);
      }
    } catch (e) {
      // Tarmoq xatosi bo'lsa default qiymatlar qoladi
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationSettings();
  }, []);

  return { station, loading, refetch: fetchStationSettings };
};
