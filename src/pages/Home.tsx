import React from 'react';
import { PackageCheck, Calendar, Calculator, Sparkles } from 'lucide-react';
import { HeroBanner } from '../components/home/HeroBanner';
import { FeaturesSection } from '../components/home/FeaturesSection';
import { PricingSection } from '../components/home/PricingSection';
import { HowItWorksSection } from '../components/home/HowItWorksSection';
import { FloatingContact } from '../components/home/FloatingContact';
import { Button } from '../components/ui/Button';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen">

      {/* ── Hero ────────────────────────────────────── */}
      <HeroBanner />

      {/* ── Quy trình 4 bước ─────────────────────── */}
      <HowItWorksSection />

      {/* ── Bảng giá từ API ──────────────────────── */}
      <PricingSection />

      {/* ── Tại sao chọn FreshWash ───────────────── */}
      <FeaturesSection />

      {/* ── Booking CTA ───────────────────────────── */}
      <section id="quick-booking" className="py-24 bg-slate-50">
        <div className="w-full max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="relative rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-100/60">
            {/* Top accent line */}
            <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-amber-400" />

            {/* Background ambient */}
            <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-cyan-50/60 rounded-full filter blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-amber-50/50 rounded-full filter blur-[80px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Left — info */}
              <div className="p-10 lg:p-14 flex flex-col justify-center space-y-8">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                    <PackageCheck className="w-3 h-3" /> Đặt lịch nhanh
                  </span>
                  <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
                    Nhận đồ tại nhà
                    <br />
                    <span className="gradient-text">chỉ 1 phút đặt lịch</span>
                  </h2>
                  <p className="mt-4 text-slate-500 text-sm leading-relaxed">
                    Shipper đến lấy theo khung giờ bạn chọn · Giao lại thơm tho sau khi hoàn thành
                  </p>
                </div>

                {/* Steps */}
                <div className="space-y-4">
                  {[
                    { icon: <Calendar className="w-4 h-4" />, step: '01', label: 'Chọn thời gian nhận đồ', color: 'cyan' },
                    { icon: <Calculator className="w-4 h-4" />, step: '02', label: 'Báo giá & cân đo tức thì', color: 'amber' },
                    { icon: <Sparkles className="w-4 h-4" />, step: '03', label: 'Nhận đồ thơm tho tận nhà', color: 'cyan' },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        item.color === 'cyan'
                          ? 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-semibold tracking-widest">Bước {item.step}</p>
                        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right — form */}
              <div className="p-10 lg:p-14 flex items-center bg-slate-50/50 border-t lg:border-t-0 lg:border-l border-slate-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert('Cảm ơn bạn đã đặt lịch! FreshWash sẽ liên hệ xác nhận ngay qua số điện thoại.');
                  }}
                  className="w-full space-y-5"
                >
                  <h3 className="font-display font-bold text-xl text-slate-800">
                    Đặt Lịch Nhận Đồ
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Họ và tên
                      </label>
                      <input required type="text" placeholder="Nguyễn Văn A" className="fw-input" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Số điện thoại
                      </label>
                      <input required type="tel" placeholder="0901 234 567" className="fw-input" />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Địa chỉ nhận đồ
                      </label>
                      <input required type="text" placeholder="Số nhà, đường, quận..." className="fw-input" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                          Ngày hẹn
                        </label>
                        <input required type="date" className="fw-input w-full" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                          Giờ nhận
                        </label>
                        <select required className="fw-input w-full cursor-pointer">
                          <option value="08:00-10:00">08:00 – 10:00</option>
                          <option value="10:00-12:00">10:00 – 12:00</option>
                          <option value="13:00-15:00">13:00 – 15:00</option>
                          <option value="15:00-17:00">15:00 – 17:00</option>
                          <option value="18:00-20:00">18:00 – 20:00</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    className="py-3.5 text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-md shadow-cyan-500/20 hover:shadow-cyan-500/35 rounded-xl transition-all duration-300"
                  >
                    Gửi Yêu Cầu Nhận Đồ
                  </Button>

                  <p className="text-center text-[11px] text-slate-400">
                    Chúng tôi sẽ gọi xác nhận trong vòng 15 phút
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Floating contact buttons ───────────────── */}
      <FloatingContact />

    </div>
  );
};
