import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export const useSummary = () => {
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);

  const fetchSummary = useCallback(async () => {
    // Tokensi bo'lmasa so'rov yubormaslik mumkin
    if (!localStorage.getItem('accessToken')) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/me/summary');
      const data = res?.data || res;
      const getVal = (...args) => {
        for (const arg of args) {
          if (arg != null) return Number(arg);
        }
        return undefined; // if nothing found, return undefined to trigger UI fallback
      };

      setSummary({
        balance:         getVal(data?.balance, data?.cashbackBalance, data?.cashback_balance, data?.cashback, data?.amount),
        cashbackPercent: getVal(data?.cashbackPercent, data?.cashback_percent, data?.percent),
        totalEarned:     getVal(data?.totalEarned, data?.total_earned, data?.earned),
        totalSpent:      getVal(data?.totalSpent, data?.total_spent, data?.spent),
        totalPurchase:   getVal(data?.totalPurchase, data?.total_purchase, data?.purchase),
        // Karta raqami — API dan kelsa ko'rsatiladi
        cardNumber:      data?.cardNumber ?? data?.card_number ?? null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
};
