import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export const useSummary = (userId) => {
  const [summary, setSummary]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error,   setError]     = useState(null);

  const fetchSummary = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/me/summary');
      const data = res?.data || res;
      setSummary({
        balance:         Number(data?.balance         ?? data?.cashback_balance   ?? 0),
        cashbackPercent: Number(data?.cashbackPercent ?? data?.cashback_percent   ?? data?.percent ?? 0),
        totalEarned:     Number(data?.totalEarned     ?? data?.total_earned       ?? data?.earned   ?? 0),
        totalSpent:      Number(data?.totalSpent      ?? data?.total_spent        ?? data?.spent    ?? 0),
        totalPurchase:   Number(data?.totalPurchase   ?? data?.total_purchase     ?? data?.purchase ?? 0),
        // Karta raqami — API dan kelsa ko'rsatiladi
        cardNumber:      data?.cardNumber ?? data?.card_number ?? null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
};
