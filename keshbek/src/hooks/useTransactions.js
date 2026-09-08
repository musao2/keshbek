import { useState, useEffect } from 'react';
import { api } from '../lib/api';

// Tranzaksiyalarni API dan olish
export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [page,         setPage]         = useState(1);
  const [hasMore,      setHasMore]      = useState(true);

  const fetchTransactions = async (pageToFetch = 1, append = false) => {
    if (!localStorage.getItem('accessToken')) return;
    setLoading(true);

    try {
      const response = await api.get(`/me/transactions?page=${pageToFetch}&limit=20`);
      const data = Array.isArray(response) ? response : (response.data || response.items || response.transactions || []);
      
      const valid = (data ?? []).filter(
        (t) => Math.abs(Number(t.amount || t.totalAmount || 0)) > 0 || Math.abs(Number(t.cashback_amount || t.cashbackAmount || 0)) > 0
      );
      
      if (append) {
        setTransactions(prev => [...prev, ...valid]);
      } else {
        setTransactions(valid);
      }

      if (data.length < 20) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage, true);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTransactions(1, false);
  }, []);

  // Yangi tranzaksiya qo'shish (Redeem API)
  const addTransaction = async (qrPayload) => {
    try {
      const response = await api.post('/transactions/redeem', { qrPayload });
      await fetchTransactions(1, false);
      return { data: response, error: null };
    } catch (err) {
      return { error: err.message || "QR-kodni tasdiqlashda xatolik yuz berdi" };
    }
  };

  return { transactions, loading, error, addTransaction, refetch: () => fetchTransactions(1, false), hasMore, loadMore };
};
