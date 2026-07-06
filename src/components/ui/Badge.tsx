import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'amber' | 'emerald' | 'indigo' | 'slate';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'cyan' }) => {
  const styles = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    slate: 'bg-white/5 text-slate-400 border border-white/5',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
};
