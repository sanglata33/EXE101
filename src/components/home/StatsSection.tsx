import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '15k+', label: 'Khách tin dùng', accent: 'cyan' },
  { value: '450k+', label: 'Kg đã giặt', accent: 'amber' },
  { value: '99.8%', label: 'Hài lòng', accent: 'cyan' },
  { value: '15+', label: 'Chi nhánh HCM', accent: 'amber' },
];

export const StatsSection: React.FC = () => {
  return (
    <section className="py-14 bg-white border-y border-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="flex flex-col items-center justify-center py-8 px-4 group"
            >
              <span
                className={`font-display font-black text-4xl sm:text-5xl tracking-tight ${
                  stat.accent === 'cyan'
                    ? 'bg-gradient-to-br from-cyan-600 to-cyan-400 bg-clip-text text-transparent'
                    : 'bg-gradient-to-br from-amber-600 to-amber-400 bg-clip-text text-transparent'
                }`}
              >
                {stat.value}
              </span>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
