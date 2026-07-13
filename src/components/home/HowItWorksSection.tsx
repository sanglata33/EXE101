import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Truck, Shirt, PackageCheck } from 'lucide-react';

const steps = [
  {
    icon: CalendarCheck,
    color: 'cyan',
    step: '01',
    title: 'Đặt lịch',
    desc: 'Chọn dịch vụ và khung giờ phù hợp. Đặt nhanh qua app hoặc Zalo — dưới 2 phút.',
  },
  {
    icon: Truck,
    color: 'amber',
    step: '02',
    title: 'Shipper đến lấy',
    desc: 'Shipper đến tận nơi trong khung giờ đã hẹn. Cân đo và báo giá trước mặt bạn.',
  },
  {
    icon: Shirt,
    color: 'cyan',
    step: '03',
    title: 'Giặt & Sấy',
    desc: 'Mỗi khách một lồng riêng. Giặt bằng nước hữu cơ, sấy chống nhăn, không lẫn đồ.',
  },
  {
    icon: PackageCheck,
    color: 'amber',
    step: '04',
    title: 'Giao tận nhà',
    desc: 'Đồ thơm tho, đóng gói cẩn thận, giao đến tay bạn. Thanh toán khi nhận.',
  },
];

const colorMap = {
  cyan:  { bg: 'bg-cyan-500',  light: 'bg-cyan-50',  text: 'text-cyan-600',  border: 'border-cyan-100',  line: 'from-cyan-300' },
  amber: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', line: 'from-amber-300' },
};

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-100/30 rounded-full filter blur-[80px] pointer-events-none" />

      <div className="w-full max-w-none px-4 sm:px-12 lg:px-16">

        {/* Header */}
        <div className="text-center max-w-md mx-auto mb-16">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
            Chỉ{' '}
            <span className="gradient-text">4 bước</span>
            {' '}đơn giản
          </h2>
          <p className="mt-3 text-slate-500 text-sm font-light">
            Từ lúc đặt đến lúc nhận đồ, bạn không cần làm gì thêm.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">

          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-9 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-cyan-200 via-amber-200 to-cyan-200 z-0" />

          {steps.map((step, i) => {
            const c = colorMap[step.color as keyof typeof colorMap];
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                {/* Step circle */}
                <div className={`relative w-16 h-16 rounded-2xl ${c.bg} flex items-center justify-center mb-5 shadow-lg`}
                  style={{ boxShadow: step.color === 'cyan' ? '0 8px 24px rgba(6,182,212,0.25)' : '0 8px 24px rgba(245,158,11,0.25)' }}
                >
                  <Icon className="w-7 h-7 text-white stroke-[1.8]" />
                  {/* Step number badge */}
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full text-[10px] font-black text-slate-600 flex items-center justify-center shadow-sm border border-slate-100">
                    {step.step}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-base mb-2">
                  {step.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
