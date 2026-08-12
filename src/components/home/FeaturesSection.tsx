import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, Sparkles, Truck, ShieldCheck, HeartPulse, Recycle } from 'lucide-react';

const features = [
  {
    icon: <Shirt className="w-5 h-5" />,
    title: 'Giặt Riêng 100%',
    desc: 'Mỗi khách một lồng riêng — không bao giờ giặt chung.',
  },
  {
    icon: <Recycle className="w-5 h-5" />,
    title: 'Nước Giặt Organic',
    desc: 'An toàn tuyệt đối cho da nhạy cảm và trẻ nhỏ.',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Sấy Chống Nhăn',
    desc: 'Công nghệ sấy đảo chiều — quần áo mềm, giữ dáng tốt.',
  },
  {
    icon: <HeartPulse className="w-5 h-5" />,
    title: 'Diệt Khuẩn UV & Ozone',
    desc: 'Loại bỏ 99.9% vi khuẩn, nấm mốc, mạt bụi nhà.',
  },
  {
    icon: <Truck className="w-5 h-5" />,
    title: 'Giao Nhận Tận Nơi',
    desc: 'Shipper đến nhà trong vòng 2 giờ sau khi đặt lịch.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'Bảo Hiểm Hư Hại',
    desc: 'Đền bù 100% nếu xảy ra sự cố trong quy trình.',
  },
];

export const FeaturesSection: React.FC = () => {
  return (
    <section className="py-28 bg-white relative overflow-hidden">
      {/* Subtle bg accent */}
      <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">

        {/* Section header */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-[#1E4DB7] border border-blue-200 rounded-full text-xs font-bold uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" /> Quy trình tiêu chuẩn 5 sao
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
            Tại sao chọn{' '}
            <span className="gradient-text">Skill Up</span>?
          </h2>
          <p className="mt-4 text-slate-600 text-sm sm:text-base font-medium">
            Công nghệ hiện đại · Tận tâm tỉ mỉ · Minh bạch từng công đoạn
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-6">
          {features.map((feat, index) => {
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group relative p-7 rounded-2xl bg-blue-50/30 border border-blue-100/80 hover:border-[#1E4DB7]/40 hover:bg-white hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
              >
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-blue-100/80 border border-blue-200 flex items-center justify-center mb-5 text-[#1E4DB7] group-hover:bg-[#1E4DB7] group-hover:text-white group-hover:scale-105 transition-all duration-300">
                  {feat.icon}
                </div>

                <h3 className="font-display font-bold text-base text-slate-900 mb-2">
                  {feat.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
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
