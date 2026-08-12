import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Scale, Package, Clock, ArrowRight, Sparkles, Loader2, ShoppingBag } from 'lucide-react';
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

/* ── Helper to map service name → correct image ──────────────── */
const getServiceImage = (name: string): string => {
  const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // Giày / sneaker / boot
  if (n.includes('giay') || n.includes('sneaker') || n.includes('boot') || n.includes('dep')) {
    return '/service_giat_giay.png';
  }
  // Vest / áo vest / áo khoác / suit / hấp / khô / lụa / cao cấp
  if (n.includes('vest') || n.includes('au') || n.includes('suit') || n.includes('hap') ||
      n.includes('kho') || n.includes('lua') || n.includes('cao cap') || n.includes('sang')) {
    return '/service_giat_vest.png';
  }
  // Rèm / sofa / nệm / thảm / mền / chăn / gối
  if (n.includes('rem') || n.includes('sofa') || n.includes('nem') || n.includes('tham') ||
      n.includes('men') || n.includes('chan') || n.includes('goi') || n.includes('may')) {
    return '/service_rem_sofa.png';
  }
  // Mặc định: giặt sấy thường
  return '/service_giat_say_moi.png';
};

/* ── Main component ──────────────────────────────────────────────── */
export const PricingSection: React.FC = () => {
  const [services, setServices] = useState<LaundryService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleCardClick = (serviceId: string) => {
    // Dispatch custom event for react-hook-form inside BookingFormSection to catch
    window.dispatchEvent(
      new CustomEvent('select-booking-service', { detail: { serviceId } })
    );

    const selectEl = document.querySelector('select[name="serviceId"]') as HTMLSelectElement;
    if (selectEl) {
      selectEl.value = serviceId;
      selectEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    const formSec = document.getElementById('quick-booking');
    if (formSec) {
      formSec.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = 'quick-booking';
    }
  };

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
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-50/40 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="w-full max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-[#1E4DB7] border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" /> Bảng giá dịch vụ
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
            Giá rõ ràng,{' '}
            <span className="gradient-text">không phát sinh</span>
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base font-medium">
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {services.map((service, i) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                onClick={() => handleCardClick(service._id)}
                className="group relative flex flex-col bg-white rounded-2xl border border-blue-100 hover:border-[#1E4DB7] hover:shadow-xl hover:shadow-blue-500/10 overflow-hidden transition-all duration-300 cursor-pointer"
              >
                {/* Service Image */}
                <div className="h-48 w-full overflow-hidden relative">
                  <img
                    src={getServiceImage(service.name)}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                  
                  {/* Select indicator on hover */}
                  <div className="absolute inset-0 bg-[#1E4DB7]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-4 py-2 bg-white/95 backdrop-blur-xs text-[#1E4DB7] text-xs font-bold rounded-full border border-blue-200 shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 animate-in fade-in zoom-in-95">
                      Đặt lịch nhanh dịch vụ này
                    </span>
                  </div>
                  
                  {/* Price type icon absolute overlay */}
                  <div className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm backdrop-blur-md bg-white/90 text-[#1E4DB7]">
                    {service.priceType === 'per_kg'
                      ? <Scale className="w-4.5 h-4.5" />
                      : <Package className="w-4.5 h-4.5" />
                    }
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Name */}
                    <h3 className="font-bold text-slate-900 text-base mb-1.5 leading-snug">
                      {service.name}
                    </h3>

                    {/* Description */}
                    {service.description && (
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {service.description}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex items-end justify-between gap-2">
                      <div>
                        <span className="text-2xl font-black text-[#1E4DB7]">
                          {formatPrice(service.price)}
                        </span>
                        <span className="text-slate-500 text-xs ml-1">
                          /{service.priceType === 'per_kg' ? 'kg' : 'món'}
                        </span>
                      </div>

                      {/* Estimated time */}
                      {service.estimatedHours && (
                        <div className="flex items-center gap-1 text-slate-500 text-xs flex-shrink-0">
                          <Clock className="w-3.5 h-3.5 text-[#1E4DB7]" />
                          <span>{service.estimatedHours}h</span>
                        </div>
                      )}
                    </div>
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
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="#quick-booking"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#1A42A0] to-[#1E4DB7] text-white font-semibold text-sm hover:from-[#1E4DB7] hover:to-[#2E62D4] shadow-lg shadow-blue-500/20 transition-all duration-300"
            >
              Đặt lịch ngay <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-blue-200 hover:border-[#1E4DB7] bg-white hover:bg-blue-50 text-slate-900 font-semibold text-sm transition-all duration-300"
            >
              Vào trang Dịch Vụ để Order <ShoppingBag className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-slate-500 text-xs mt-3">
            Đặt lịch dễ dàng · Cung cấp nhiều tùy chọn thanh toán và giỏ hàng đa dạng
          </p>
        </motion.div>

      </div>
    </section>
  );
};
