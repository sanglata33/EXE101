import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Nguyễn Minh Thư',
    role: 'Nhân viên văn phòng, Q.3',
    text: 'FreshWash đã chinh phục tôi hoàn toàn. Vest về đúng dáng, mùi hương tinh tế, đóng gói cẩn thận.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Trần Hoàng Nam',
    role: 'Lập trình viên, Q. Bình Thạnh',
    text: 'App đặt lịch tiện lợi, shipper đúng giờ, theo dõi trạng thái qua tin nhắn. Tiết kiệm cả cuối tuần.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
  },
  {
    name: 'Lê Thị Thu Hà',
    role: 'Kinh doanh tự do, Q.7',
    text: 'Da con nhạy cảm, từ khi dùng nước giặt hữu cơ của FreshWash không bị ngứa nữa. Cực kỳ tin tưởng.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-28 bg-slate-50 relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-100/40 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-100/40 rounded-full filter blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Ý kiến khách hàng
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
            Khách hàng nói gì về{' '}
            <span className="gradient-text">FreshWash</span>?
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((test, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative flex flex-col justify-between bg-white border border-slate-100 rounded-2xl p-7 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              {/* Large quote */}
              <div className="absolute top-5 right-6 text-slate-100">
                <Quote className="w-10 h-10 stroke-[1.5]" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {[...Array(test.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Text */}
              <p className="text-slate-700 text-sm leading-relaxed mb-7 flex-1 italic">
                "{test.text}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-slate-100">
                <img
                  src={test.avatar}
                  alt={test.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-slate-200"
                />
                <div>
                  <p className="font-bold text-slate-800 text-sm">{test.name}</p>
                  <p className="text-xs text-slate-500">{test.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
