import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scale, Package, Clock, ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { getAllServices, type LaundryService } from '../../api/serviceService';

/* ── Format giá VNĐ ──────────────────────────────────────────────── */
const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

/* ── Skeleton card ───────────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6 animate-pulse">
    <div className="h-10 w-10 rounded-xl bg-slate-100 mb-5" />
    <div className="h-4 w-3/4 bg-slate-100 rounded mb-2" />
    <div className="h-3 w-full bg-slate-100 rounded mb-1" />
    <div className="h-3 w-5/6 bg-slate-100 rounded mb-5" />
    <div className="h-8 w-1/2 bg-slate-100 rounded" />
  </div>
);

/* ── Main component ──────────────────────────────────────────────── */
export const PricingSection: React.FC = () => {
  const [services, setServices] = useState<LaundryService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAllServices()
      .then(data => {
        // Chỉ hiển thị dịch vụ đang hoạt động
        setServices(data.filter(s => s.isActive));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="bang-gia" className="py-24 bg-white relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-50/50 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-amber-50/40 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3 h-3" /> Bảng giá dịch vụ
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
            Giá rõ ràng,{' '}
            <span className="gradient-text">không phát sinh</span>
          </h2>
          <p className="mt-4 text-slate-500 text-sm sm:text-base font-light">
            Báo giá chính xác trước khi nhận đồ. Không phụ thu, không ẩn phí.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-16">
            <Loader2 className="w-8 h-8 text-slate-300 mx-auto mb-3 animate-spin" />
            <p className="text-slate-400 text-sm">Không thể tải dịch vụ. Vui lòng thử lại sau.</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && services.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Chưa có dịch vụ nào. Vui lòng quay lại sau.</p>
          </div>
        )}

        {/* Service cards */}
        {!loading && !error && services.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((service, i) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="group relative flex flex-col bg-white rounded-2xl border border-slate-100 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-50/80 p-6 transition-all duration-300"
              >
                {/* Price type icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 border transition-transform duration-300 group-hover:scale-105 ${
                  service.priceType === 'per_kg'
                    ? 'bg-cyan-50 border-cyan-100 text-cyan-600'
                    : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                  {service.priceType === 'per_kg'
                    ? <Scale className="w-5 h-5" />
                    : <Package className="w-5 h-5" />
                  }
                </div>

                {/* Name */}
                <h3 className="font-bold text-slate-800 text-base mb-1.5 leading-snug">
                  {service.name}
                </h3>

                {/* Description */}
                {service.description && (
                  <p className="text-slate-500 text-sm leading-relaxed mb-4 flex-1">
                    {service.description}
                  </p>
                )}

                {/* Price */}
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <span className={`text-2xl font-black ${
                        service.priceType === 'per_kg'
                          ? 'text-cyan-600'
                          : 'text-amber-600'
                      }`}>
                        {formatPrice(service.price)}
                      </span>
                      <span className="text-slate-400 text-xs ml-1">
                        /{service.priceType === 'per_kg' ? 'kg' : 'món'}
                      </span>
                    </div>

                    {/* Estimated time */}
                    {service.estimatedHours && (
                      <div className="flex items-center gap-1 text-slate-400 text-xs flex-shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{service.estimatedHours}h</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400 text-white font-semibold text-sm hover:from-cyan-400 hover:to-cyan-300 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-300"
          >
            Đặt lịch ngay <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-slate-400 text-xs mt-3">
            Đăng nhập để đặt dịch vụ · Thanh toán sau khi nhận đồ
          </p>
        </motion.div>

      </div>
    </section>
  );
};
