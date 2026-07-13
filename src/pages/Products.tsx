import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, SlidersHorizontal, Star, Clock, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products } from '../data/products';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

/* ─── Category config ────────────────────────────────────────────── */
const CATEGORIES = [
  { value: 'all',      label: 'Tất Cả',            emoji: '✨' },
  { value: 'laundry',  label: 'Giặt Sấy',           emoji: '👕' },
  { value: 'dryclean', label: 'Giặt Hấp (Khô)',     emoji: '🧥' },
  { value: 'ironing',  label: 'Ủi Phẳng',           emoji: '👔' },
  { value: 'special',  label: 'Chăm Sóc Đặc Biệt',  emoji: '⭐' },
];

const CATEGORY_ACCENT: Record<string, { pill: string; dot: string }> = {
  laundry:  { pill: 'bg-cyan-50 text-cyan-700 border-cyan-200',    dot: 'bg-cyan-500'   },
  dryclean: { pill: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  ironing:  { pill: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500'  },
  special:  { pill: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
};

/* ─── Stagger variants ───────────────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } },
  exit:   { opacity: 0, scale: 0.94, transition: { duration: 0.18 } },
} as const;

/* ─── Product Card ───────────────────────────────────────────────── */
const ServiceCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart } = useCart();
  const [imgErr, setImgErr] = useState(false);
  const accent = CATEGORY_ACCENT[product.category] ?? CATEGORY_ACCENT.special;

  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

  return (
    <motion.div
      variants={item}
      whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className="group relative flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/60 hover:border-slate-200 transition-shadow duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {imgErr ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 gap-2">
            <ShoppingBag className="w-8 h-8 text-slate-300" />
            <span className="text-[10px] text-slate-400 text-center px-4">{product.name}</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold backdrop-blur-sm bg-white/85 ${accent.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${accent.dot}`} />
            {product.categoryLabel}
          </span>
        </div>

        {/* Time */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-semibold text-slate-700 border border-white/60 shadow-sm">
            <Clock className="w-3 h-3 text-cyan-600" />
            {product.timeEstimate}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 p-5 gap-2.5">
        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="text-xs font-bold text-slate-700">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({product.reviewsCount})</span>
        </div>

        {/* Name */}
        <Link to={`/products/${product.id}`}>
          <h3 className="font-display font-bold text-[15px] text-slate-900 leading-snug line-clamp-2 group-hover:text-cyan-600 transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-1">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Đơn giá</p>
            <p className="font-display font-extrabold text-lg text-slate-900 leading-none">
              {fmt(product.price)}
              <span className="text-xs font-semibold text-slate-400 ml-1">₫/{product.unit}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/products/${product.id}`}
              className="flex items-center gap-1 px-3 py-2 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-xl hover:border-cyan-300 hover:text-cyan-600 transition-all duration-200"
            >
              Chi tiết <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              onClick={() => addToCart(product, 1)}
              className="p-2 bg-gradient-to-br from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-xl shadow-md shadow-cyan-500/20 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Thêm vào giỏ"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Main Products Page ─────────────────────────────────────────── */
export const Products: React.FC = () => {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');

  const filtered = useMemo(() =>
    products.filter(p => {
      const q = search.toLowerCase();
      return (
        (cat === 'all' || p.category === cat) &&
        (p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      );
    }),
  [search, cat]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Hero banner ─────────────────────────────── */}
      <div className="relative overflow-hidden bg-white border-b border-slate-100 pt-24 pb-5">
        {/* Ambient blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-100/50 rounded-full filter blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-100/40 rounded-full filter blur-[80px] pointer-events-none" />

        <div className="w-full max-w-none px-4 sm:px-12 lg:px-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3 h-3" /> Danh mục dịch vụ
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight mb-2">
              Bảng giá <span className="gradient-text">giặt ủi cao cấp</span>
            </h1>
            <p className="text-slate-500 text-base font-light leading-relaxed">
              Giá minh bạch · Tính theo kg hoặc sản phẩm · Chất lượng đảm bảo
            </p>
          </motion.div>
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────── */}
      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="w-full max-w-none px-4 sm:px-12 lg:px-16 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Category pills — horizontal scroll on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 pb-0.5">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                onClick={() => setCat(c.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-250 cursor-pointer whitespace-nowrap ${
                  cat === c.value
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64 flex-shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm dịch vụ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-transparent rounded-full text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-cyan-400 focus:bg-white transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* ── Grid ────────────────────────────────────── */}
      <div className="w-full max-w-none px-4 sm:px-12 lg:px-16 py-6">
        {/* Result count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-800">{filtered.length}</span> dịch vụ
            {cat !== 'all' && <span className="ml-1">trong "{CATEGORIES.find(c => c.value === cat)?.label}"</span>}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-cyan-600 hover:underline cursor-pointer"
            >
              Xoá tìm kiếm
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={`${cat}-${search}`}
              variants={container}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map(product => (
                <ServiceCard key={product.id} product={product} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                <SlidersHorizontal className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-display font-bold text-slate-800 text-lg mb-2">
                Không tìm thấy dịch vụ
              </h3>
              <p className="text-slate-500 text-sm max-w-xs">
                Thử tìm với từ khóa khác hoặc chọn danh mục "Tất Cả".
              </p>
              <button
                onClick={() => { setSearch(''); setCat('all'); }}
                className="mt-5 px-5 py-2 bg-cyan-600 text-white text-sm font-semibold rounded-xl hover:bg-cyan-500 transition-colors cursor-pointer"
              >
                Xem tất cả dịch vụ
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
