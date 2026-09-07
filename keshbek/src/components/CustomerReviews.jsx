import React, { useState, useEffect, useCallback } from 'react';
import { 
  IoStar, 
  IoStarOutline,
  IoCheckmarkCircle, 
  IoSparkles,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoTimeOutline,
  IoChatbubbleEllipsesOutline,
  IoSend,
  IoClose,
} from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

// ----- Yulduz rangi yordamchi -----
const StarRow = ({ rating, size = 14 }) =>
  [1, 2, 3, 4, 5].map(s => (
    <IoStar
      key={s}
      style={{ fontSize: size }}
      className={s <= rating ? 'text-amber-400' : 'text-gray-200'}
    />
  ));

// ----- Sana formatlash -----
const fmtDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const diffH = Math.floor((Date.now() - d) / 3600000);
  if (diffH < 1)  return 'Hozirgina';
  if (diffH < 24) return `${diffH} soat oldin`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'Kecha';
  if (diffD < 30)  return `${diffD} kun oldin`;
  return `${d.getDate()}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()}`;
};

// ========== SHARH QOLDIRISH MODALI ==========
const ReviewModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [rating,      setRating]      = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment,     setComment]     = useState('');
  const [submitting,  setSubmitting]  = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [blocked,     setBlocked]     = useState(false);   // 7 kunlik cheklov
  const [daysLeft,    setDaysLeft]    = useState(7);
  const [checking,    setChecking]    = useState(true);

  // Modal ochilganda can-review tekshirish
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res  = await api.get('/station/reviews/can-review');
        const data = res?.data || res;
        if (alive) {
          if (data?.canReview === false) {
            setBlocked(true);
            setDaysLeft(data.daysRemaining ?? 7);
          } else {
            setBlocked(false);
          }
        }
      } catch (e) {
        // 403 yoki server xatosi → bloklanmagan deb hisoblaymiz
        if (alive) setBlocked(false);
      } finally {
        if (alive) setChecking(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/station/reviews', { rating, comment: comment.trim() });
      setSubmitted(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2200);
    } catch (err) {
      if (err.message?.includes('403') || err.message?.toLowerCase().includes('week')) {
        setBlocked(true); setDaysLeft(7);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const ratingLabels = { 5: "A'lo xizmat! (5/5)", 4: "Yaxshi (4/5)", 3: "Qoniqarli (3/5)", 2: "Yomon emas (2/5)", 1: "Yomon (1/5)" };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm font-sans">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden border border-gray-100">

        {/* Yuqori chiziq */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0c613c] via-[#0f7b4c] to-[#0bd39a]" />

        {/* Yopish */}
        <button onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer">
          <IoClose size={18} />
        </button>

        {/* Yuklanmoqda */}
        {checking ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#0f7b4c] rounded-full animate-spin" />
          </div>

        ) : blocked ? (
          /* 7 kunlik cheklov */
          <div className="py-6 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <IoTimeOutline size={32} />
            </div>
            <h3 className="font-extrabold text-[17px] text-gray-900">1 haftada 1 marta sharh</h3>
            <p className="text-[13px] text-gray-500 max-w-[240px] leading-relaxed">
              Siz bu hafta allaqachon fikr bildirgansiz. Rahmat! ⭐️
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 text-[12px] font-bold text-amber-800">
              Keyingi sharh {daysLeft} kundan so'ng ochiq bo'ladi
            </div>
            <button onClick={onClose}
              className="mt-1 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-[13px] transition-colors cursor-pointer">
              Tushunarli
            </button>
          </div>

        ) : submitted ? (
          /* Muvaffaqiyat */
          <div className="py-8 text-center flex flex-col items-center gap-3">
            <div className="w-16 h-16 bg-[#e6f4ed] text-[#0f7b4c] rounded-full flex items-center justify-center animate-bounce">
              <IoCheckmarkCircle size={40} />
            </div>
            <h3 className="font-extrabold text-[18px] text-gray-900">Katta rahmat!</h3>
            <p className="text-[13px] text-gray-500 max-w-[220px]">
              Fikringiz saqlandi va ko'rsatiladi.
            </p>
          </div>

        ) : (
          /* Forma */
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-2.5">
                <IoSparkles size={24} />
              </div>
              <h3 className="font-extrabold text-[18px] text-gray-900">Fikringizni qoldiring</h3>
              <p className="text-[12px] text-gray-500 mt-1">Xizmat sifati haqida yulduzli baho bering:</p>
            </div>

            {/* Yulduzlar */}
            <div className="flex items-center gap-2 justify-center py-3 bg-amber-50/60 rounded-2xl border border-amber-100">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverRating(s)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer">
                  {s <= (hoverRating || rating)
                    ? <IoStar className="text-amber-400 text-[32px]" />
                    : <IoStarOutline className="text-gray-300 text-[32px]" />}
                </button>
              ))}
            </div>
            <p className="text-center text-[12px] font-bold text-amber-700">⭐ {ratingLabels[rating]}</p>

            {/* Textarea */}
            <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Xizmat ko'rsatish va yoqilg'i sifati haqida fikringizni yozing..."
              required autoFocus
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-2xl text-[13px] outline-none focus:border-[#0f7b4c] text-gray-800 resize-none font-medium" />

            <button type="submit" disabled={submitting || !comment.trim()}
              className="w-full py-3 bg-[#0f7b4c] text-white font-extrabold rounded-2xl text-[14px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-[#0f7b4c]/20 disabled:opacity-60 cursor-pointer">
              {submitting ? <span>Saqlanmoqda...</span> : <><IoSend size={16} /><span>Sharhni Yuborish</span></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// ========== ASOSIY KOMPONENT ==========
const CustomerReviews = () => {
  const { user } = useAuth();

  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [hasMore,    setHasMore]    = useState(false);
  const [page,       setPage]       = useState(1);
  const [showAll,    setShowAll]    = useState(false);
  const [showModal,  setShowModal]  = useState(false);
  const [avgRating,  setAvgRating]  = useState(null);

  const fetchReviews = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true);
    try {
      const res = await api.get(`/station/reviews?page=${pageNum}&limit=10`);
      const raw = res?.data?.reviews || res?.data || res?.reviews || res || [];

      // items massivini olish
      let items = Array.isArray(raw) ? raw : (raw?.items || raw?.data || []);

      if (!Array.isArray(items)) items = [];

      const formatted = items.map(r => ({
        id:         r.id || r._id || String(Math.random()),
        user_name:  r.user?.firstName
                      ? `${r.user.firstName} ${r.user.lastName || ''}`.trim()
                      : r.user_name || r.userName || r.name || 'Mijoz',
        rating:     Number(r.rating) || 5,
        comment:    r.comment || r.text || '',
        created_at: r.created_at || r.createdAt || new Date().toISOString(),
      }));

      if (append) {
        setReviews(prev => [...prev, ...formatted]);
      } else {
        setReviews(formatted);
        // O'rtacha reyting
        if (formatted.length > 0) {
          const avg = formatted.reduce((a, r) => a + r.rating, 0) / formatted.length;
          setAvgRating(avg.toFixed(1));
        }
      }

      // 10 ta kelsa yana bor
      setHasMore(items.length >= 10);
    } catch (e) {
      if (!append) setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(1, false); }, [fetchReviews]);

  const handleLoadMore = async () => {
    const next = page + 1;
    setPage(next);
    await fetchReviews(next, true);
    setShowAll(true);
  };

  const visibleReviews = showAll ? reviews : reviews.slice(0, 5);
  const totalCount = reviews.length;

  return (
    <div className="mx-4 mt-6 font-sans pb-6">

      {/* Sarlavha */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-[18px] text-gray-900 flex items-center gap-2">
              <span>Mijozlar fikrlari</span>
              <IoSparkles className="text-amber-400" />
            </h3>
            <p className="text-[12px] text-gray-500 mt-0.5">
              To'lov qilgan tasdiqlangan mijozlar sharhlari
            </p>
          </div>

          {/* O'rtacha reyting */}
          {avgRating && (
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-2xl">
                <IoStar className="text-amber-400 text-[18px]" />
                <span className="font-extrabold text-amber-700 text-[16px]">{avgRating}</span>
              </div>
              <span className="text-[11px] text-gray-400 font-medium mt-1">{totalCount} ta sharh</span>
            </div>
          )}
        </div>

        {/* Sharh qoldirish tugmasi */}
        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 w-full py-2.5 bg-[#0f7b4c] text-white font-bold rounded-2xl text-[13px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm cursor-pointer">
            <IoChatbubbleEllipsesOutline size={16} />
            Fikr bildirish (haftada 1 marta)
          </button>
        )}
      </div>

      {/* Yuklanmoqda */}
      {loading && reviews.length === 0 && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-2 border-emerald-100 border-t-[#0f7b4c] rounded-full animate-spin" />
        </div>
      )}

      {/* Bo'sh holat */}
      {!loading && reviews.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-gray-400">
            <IoChatbubbleEllipsesOutline size={26} />
          </div>
          <p className="font-bold text-gray-700 text-[14px]">Hali sharhlar yo'q</p>
          <p className="text-gray-400 text-[12px] mt-1">Birinchi bo'lib fikr bildiring!</p>
        </div>
      )}

      {/* Sharhlar ro'yxati */}
      {visibleReviews.length > 0 && (
        <div className="space-y-3">
          {visibleReviews.map(rev => (
            <div key={rev.id}
              className="bg-white rounded-2xl p-4 shadow-xs border border-gray-100 hover:border-gray-200 transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-[14px] text-gray-900">
                      {rev.user_name}
                    </h4>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0f7b4c] bg-[#e6f4ed] px-2 py-0.5 rounded-md">
                      <IoCheckmarkCircle className="text-[#0f7b4c]" />
                      Mijoz
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    <StarRow rating={rev.rating} />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-gray-400 shrink-0">
                  {fmtDate(rev.created_at)}
                </span>
              </div>

              {rev.comment && (
                <p className="text-[13px] text-gray-700 leading-relaxed font-medium">
                  "{rev.comment}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ko'proq / Qisqartirish tugmasi */}
      {reviews.length > 5 && (
        <div className="mt-4 text-center">
          {!showAll ? (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-3 px-4 bg-white border border-gray-200 rounded-2xl text-[13px] font-bold text-[#0f7b4c] hover:bg-[#e6f4ed] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs cursor-pointer">
              <span>Barchasini ko'rish ({reviews.length} ta)</span>
              <IoChevronDownOutline size={16} />
            </button>
          ) : (
            <>
              {hasMore && (
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full mb-2 py-3 px-4 bg-[#0f7b4c] text-white rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm cursor-pointer disabled:opacity-60">
                  {loading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Ko'proq yuklash</span><IoChevronDownOutline size={16} /></>}
                </button>
              )}
              <button
                onClick={() => setShowAll(false)}
                className="w-full py-3 px-4 bg-white border border-gray-200 rounded-2xl text-[13px] font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs cursor-pointer">
                <span>Qisqartirish</span>
                <IoChevronUpOutline size={16} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Sharh qoldirish modali */}
      {showModal && (
        <ReviewModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { fetchReviews(1, false); setPage(1); setShowAll(false); }}
        />
      )}
    </div>
  );
};

export default CustomerReviews;
