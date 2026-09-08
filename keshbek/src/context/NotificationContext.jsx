import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

const NotificationContext = createContext(null);

const playNotificationSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, now + 0.12);
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch (e) {}
};

const triggerVibration = () => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([200, 100, 200]); } catch (e) {}
  }
};

const normalizeNotif = (n) => ({
  id:         n.id,
  title:      n.title || 'Bildirishnoma',
  message:    n.message || n.body || '',
  amount:     n.amount ? Math.abs(Number(n.amount)) : 0,
  is_read:    n.isRead !== undefined ? !!n.isRead : !!n.is_read,
  created_at: n.createdAt || n.created_at || new Date().toISOString(),
  type:       n.type || 'general',
});

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);
  const [latestToast, setLatestToast]     = useState(null);
  const prevUnreadRef = useRef(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/me/notifications/unread-count');
      const count = res?.count ?? res?.unreadCount ?? res?.data?.count ?? 0;
      setUnreadCount(Number(count));
    } catch (e) {}
  }, [user]);

  const fetchNotifications = useCallback(async (page = 1, limit = 20) => {
    if (!user) { setNotifications([]); return; }
    setLoading(true);
    try {
      const res = await api.get('/me/notifications?page=' + page + '&limit=' + limit);
      const rawList =
        Array.isArray(res)                ? res :
        Array.isArray(res?.data)          ? res.data :
        Array.isArray(res?.items)         ? res.items :
        Array.isArray(res?.notifications) ? res.notifications :
        [];
      const items = rawList.map(normalizeNotif);
      items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(items);
      const newUnread = items.filter(n => !n.is_read).length;
      if (prevUnreadRef.current >= 0 && newUnread > prevUnreadRef.current) {
        const newest = items.find(n => !n.is_read);
        if (newest) {
          setLatestToast(newest);
          playNotificationSound();
          triggerVibration();
          setTimeout(() => setLatestToast(null), 5000);
        }
      }
      prevUnreadRef.current = newUnread;
      setUnreadCount(newUnread);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = async (notificationId) => {
    if (!notificationId) return;
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await api.post('/me/notifications/' + notificationId + '/read', {});
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    if (!user || unreadCount === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await api.post('/me/notifications/read-all', {});
    } catch (e) {}
  };

  useEffect(() => {
    if (user) {
      prevUnreadRef.current = -1;
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
      prevUnreadRef.current = 0;
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchNotifications();
    }, 180000); // 3 daqiqa
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        latestToast,
        setLatestToast,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications MUST be used within a NotificationProvider');
  }
  return context;
};
