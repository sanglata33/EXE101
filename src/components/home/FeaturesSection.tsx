import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, Sparkles, Truck, ShieldCheck, HeartPulse, Recycle } from 'lucide-react';

const features = [
  {
    icon: <Shirt className="w-5 h-5" />,
    color: 'cyan',
    title: 'Giặt Riêng 100%',
    desc: 'Mỗi khách một lồng riêng — không bao giờ giặt chung.',
  },
  {
    icon: <Recycle className="w-5 h-5" />,
    color: 'green',
    title: 'Nước Giặt Organic',
    desc: 'An toàn tuyệt đối cho da nhạy cảm và trẻ nhỏ.',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    color: 'amber',
    title: 'Sấy Chống Nhăn',
    desc: 'Công nghệ sấy đảo chiều — quần áo mềm, giữ dáng tốt.',
  },
  {
    icon: <HeartPulse className="w-5 h-5" />,
    color: 'purple',
    title: 'Diệt Khuẩn UV & Ozone',
    desc: 'Loại bỏ 99.9% vi khuẩn, nấm mốc, mạt bụi nhà.',
  },
  {
    icon: <Truck className="w-5 h-5" />,
    color: 'amber',
    title: 'Giao Nhận Tận Nơi',
    desc: 'Shipper đến nhà trong vòng 2 giờ sau khi đặt lịch.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    color: 'cyan',
    title: 'Bảo Hiểm Hư Hại',
    desc: 'Đền bù 100% nếu xảy ra sự cố trong quy trình.',
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  cyan:   { bg: 'bg-[#C5A880]/10',   text: 'text-[#C5A880]',   border: 'border-[#C5A880]/20' },
  amber:  { bg: 'bg-[#C5A880]/15',  text: 'text-[#BCA374]',  border: 'border-[#EBE3D5]' },
  green:  { bg: 'bg-[#FAF6F0]', text: 'text-[#8E7A58]', border: 'border-[#EBE3D5]' },
  purple: { bg: 'bg-[#FCFBF9]', text: 'text-[#D4AF37]',  border: 'border-[#EBE3D5]' },
};

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-28 bg-[#FCFBF9] relative overflow-hidden">
      {/* Subtle bg accent */}
      <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-[#C5A880]/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">

        {/* Section header */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C5A880]/10 text-[#8E7A58] border border-[#EBE3D5] rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3 h-3" /> Quy trình tiêu chuẩn 5 sao
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2A2520] leading-tight">
            Tại sao chọn{' '}
            <span className="gradient-text">Skill-Up</span>?
          </h2>
          <p className="mt-4 text-[#756458] text-sm sm:text-base font-light">
            Công nghệ hiện đại · Tận tâm tỉ mỉ · Minh bạch từng công đoạn
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-6">
          {features.map((feat, index) => {
            const c = colorMap[feat.color];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative p-7 rounded-2xl bg-white border border-slate-100 hover:border-[#C5A880]/50 hover:shadow-lg hover:shadow-gold-500/5 transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <span className={c.text}>{feat.icon}</span>
                </div>

                <h3 className="font-display font-bold text-base text-[#2A2520] mb-2">
                  {feat.title}
                </h3>
                <p className="text-[#756458] text-sm leading-relaxed">
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
