import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Shirt, PackageCheck } from 'lucide-react';

const steps = [
  {
    icon: CalendarCheck,
    color: 'gold',
    step: '01',
    title: 'Đặt Hàng',
    desc: 'Đặt trực tuyến trong 60 giây — chọn dịch vụ, địa chỉ và thời gian. Xác nhận nhanh chóng.',
  },
  {
    icon: Shirt,
    color: 'gold',
    step: '02',
    title: 'Giặt Sạch Thơm',
    desc: 'Chúng tôi lấy đồ, phân loại, giặt riêng bằng máy cao cấp với nước giặt organic và gấp tay tỉ mỉ.',
  },
  {
    icon: PackageCheck,
    color: 'gold',
    step: '03',
    title: 'Giao Tận Cửa',
    desc: 'Quần áo thơm tho được giao tận cửa đúng giờ hẹn. Bạn kiểm tra đồ và thanh toán khi nhận.',
  },
];

const colorMap = {
  gold: { bg: 'bg-[#C5A880]', light: 'bg-[#FAF6F0]', text: 'text-[#8E7A58]', border: 'border-[#EBE3D5]', line: 'from-[#C5A880]' },
};

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#FAF6F0] relative overflow-hidden">
      {/* Decorative background blur */}
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#C5A880]/10 rounded-full filter blur-[80px] pointer-events-none" />

      <div className="w-full max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">

        {/* Header */}
        <div className="text-center max-w-md mx-auto mb-16">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2A2520] leading-tight">
            Chỉ{' '}
            <span className="gradient-text">3 bước</span>
            {' '}đơn giản
          </h2>
          <p className="mt-3 text-[#756458] text-sm font-light">
            Từ lúc đặt đơn đến khi nhận lại quần áo sạch thơm, bạn không cần bận tâm điều gì.
          </p>
        </div>

        {/* Clothesline Decoration (giatoi.vn style) */}
        <div className="max-w-3xl mx-auto mb-12 opacity-80" aria-hidden="true">
          <svg viewBox="0 -42 800 152" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" className="w-full h-auto">
            {/* Sun */}
            <g transform="translate(700, -18)">
              <circle cx="0" cy="0" r="16" fill="#D4AF37" stroke="#2A2520" strokeWidth="2.5"/>
              <g stroke="#2A2520" strokeWidth="2.2" strokeLinecap="round">
                <line x1="-28" y1="0"  x2="-22" y2="0"/>
                <line x1="28"  y1="0"  x2="22"  y2="0"/>
                <line x1="0"   y1="-28" x2="0"   y2="-22"/>
                <line x1="0"   y1="22"  x2="0"   y2="28"/>
                <line x1="-20" y1="-20" x2="-15" y2="-15"/>
                <line x1="20"  y1="-20" x2="15"  y2="-15"/>
                <line x1="-20" y1="20"  x2="-15" y2="15"/>
                <line x1="20"  y1="20"  x2="15"  y2="15"/>
              </g>
            </g>

            {/* The rope: droop across */}
            <path d="M10 22 Q400 48 790 22" stroke="#2A2520" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

            {/* T-shirt (gold/champagne) */}
            <g transform="translate(180, 24)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="#2A2520" strokeWidth="2.5"/>
              <path d="M-22 10 L-30 20 L-22 28 L-15 22 L-15 60 L15 60 L15 22 L22 28 L30 20 L22 10 L13 10 Q0 18 -13 10 Z" fill="#C5A880" stroke="#2A2520" strokeWidth="2.5" strokeLinejoin="round"/>
            </g>

            {/* Towel (ivory) */}
            <g transform="translate(360, 32)">
              <line x1="-14" y1="-2" x2="-14" y2="6" stroke="#2A2520" strokeWidth="2.5"/>
              <line x1="14" y1="-2" x2="14" y2="6" stroke="#2A2520" strokeWidth="2.5"/>
              <rect x="-22" y="6" width="44" height="56" rx="3" fill="#F3EEE6" stroke="#2A2520" strokeWidth="2.5"/>
              <line x1="-22" y1="16" x2="22" y2="16" stroke="#2A2520" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4"/>
              <line x1="-22" y1="52" x2="22" y2="52" stroke="#2A2520" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4"/>
            </g>

            {/* Pants (bronze/brown) */}
            <g transform="translate(540, 34)">
              <line x1="-12" y1="-4" x2="-12" y2="4" stroke="#2A2520" strokeWidth="2.5"/>
              <line x1="12" y1="-4" x2="12" y2="4" stroke="#2A2520" strokeWidth="2.5"/>
              <path d="M-20 4 L-22 60 L-6 60 L0 22 L6 60 L22 60 L20 4 Z" fill="#8E7A58" stroke="#2A2520" strokeWidth="2.5" strokeLinejoin="round"/>
            </g>
          </svg>
        </div>

        {/* Steps flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-5xl mx-auto mt-16">

          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-gradient-to-r from-[#FAF6F0] via-[#C5A880]/30 to-[#FAF6F0] z-0" />

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
                className="relative z-10 flex flex-col items-center text-center px-4"
              >
                {/* Step circle */}
                <div className={`relative w-16 h-16 rounded-2xl ${c.bg} flex items-center justify-center mb-5 shadow-md`}
                  style={{ boxShadow: '0 8px 24px rgba(197, 168, 128, 0.15)' }}
                >
                  <Icon className="w-7 h-7 text-white stroke-[1.8]" />
                  {/* Step number badge */}
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#FCFBF9] rounded-full text-[10px] font-black text-[#2A2520] flex items-center justify-center shadow-sm border border-[#EBE3D5]">
                    {step.step}
                  </span>
                </div>

                <h3 className="font-bold text-[#2A2520] text-base mb-2">
                  {step.title}
                </h3>
                <p className="text-[#756458] text-sm leading-relaxed">
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
