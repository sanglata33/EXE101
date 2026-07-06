import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingBag, Clock, ArrowRight } from 'lucide-react';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const categoryStyle: Record<string, { dot: string; text: string; bg: string }> = {
  laundry:  { dot: 'bg-cyan-500',   text: 'text-cyan-700',   bg: 'bg-cyan-50/90' },
  dryclean: { dot: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50/90' },
  ironing:  { dot: 'bg-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50/90' },
  special:  { dot: 'bg-violet-500', text: 'text-violet-700', bg: 'bg-violet-50/90' },
};

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [imgError, setImgError] = useState(false);

  const cs = categoryStyle[product.category] ?? categoryStyle.special;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN').format(price);

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative flex flex-col h-full bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:shadow-slate-200/60 hover:border-slate-200 transition-all duration-300"
    >
      {/* ── Image area ─────────────────────────── */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {imgError ? (
          /* Fallback placeholder when image fails */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/80 flex items-center justify-center shadow-sm">
              <ShoppingBag className="w-7 h-7 text-slate-400" />
            </div>
            <span className="text-xs font-medium text-slate-400">{product.name}</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-sm border border-white/30 ${cs.bg} ${cs.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cs.dot}`} />
            {product.categoryLabel}
          </span>
        </div>

        {/* Time badge */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[11px] font-semibold text-slate-700 border border-white/50 shadow-sm">
            <Clock className="w-3 h-3 text-cyan-600" />
            {product.timeEstimate}
          </span>
        </div>
      </div>

      {/* ── Details ────────────────────────────── */}
      <div className="flex flex-col flex-grow p-5 gap-3">
        {/* Rating */}
        <div className="flex items-center gap-1">
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

        {/* Description — 2 lines max */}
        <p className="text-slate-500 text-xs leading-relaxed line-clamp-2 flex-1">
          {product.description}
        </p>

        {/* Price + Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Price */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
              Đơn giá
            </p>
            <p className="font-display font-extrabold text-lg text-slate-900 leading-none">
              {formatPrice(product.price)}
              <span className="text-xs font-semibold text-slate-400 ml-1">₫/{product.unit}</span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to={`/products/${product.id}`}
              className="flex items-center gap-1 px-3 py-2 text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-xl hover:border-cyan-300 hover:text-cyan-600 transition-all duration-200"
            >
              Chi tiết
              <ArrowRight className="w-3 h-3" />
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
