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
  cyan:   { bg: 'bg-cyan-50',   text: 'text-cyan-600',   border: 'border-cyan-100' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100' },
  green:  { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
  purple: { bg: 'bg-violet-50', text: 'text-violet-600',  border: 'border-violet-100' },
};

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-28 bg-white relative overflow-hidden">
      {/* Subtle bg accent */}
      <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-cyan-50/60 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="w-full max-w-none px-4 sm:px-12 lg:px-16 relative z-10">

        {/* Section header */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3 h-3" /> Quy trình tiêu chuẩn 5 sao
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
            Tại sao chọn{' '}
            <span className="gradient-text">FreshWash</span>?
          </h2>
          <p className="mt-4 text-slate-500 text-sm sm:text-base font-light">
            Công nghệ hiện đại · Tận tâm tỉ mỉ · Minh bạch từng công đoạn
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, index) => {
            const c = colorMap[feat.color];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative p-7 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-100/60 transition-all duration-300"
              >
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                  <span className={c.text}>{feat.icon}</span>
                </div>

                <h3 className="font-display font-bold text-base text-slate-800 mb-2">
                  {feat.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
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
