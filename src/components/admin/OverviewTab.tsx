import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Activity,
  BarChart3,
} from 'lucide-react';
import type { DashboardStats } from '../../api/adminService';

interface OverviewTabProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

/* ── KPI Card ─────────────────────────────────────────────────────── */
const KpiCard: React.FC<{
  label: string;
  value: string | number;
  subtext: string;
  change?: number | null;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}> = ({ label, value, subtext, change, icon, gradient, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 18 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg group cursor-default ${gradient}`}
  >
    {/* Decorative circle */}
    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
    <div className="absolute -bottom-4 -right-2 w-16 h-16 bg-white/5 rounded-full" />

    <div className="relative z-10">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm flex-shrink-0">
          {icon}
        </div>
        {change !== null && change !== undefined && (
          <span className="flex items-center gap-0.5 text-[11px] font-bold bg-white/20 px-2 py-0.5 rounded-full">
            {change >= 0
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>

      <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-2xl font-black tracking-tight leading-none">{value}</h3>
      <p className="text-[11px] text-white/60 mt-1.5 font-medium">{subtext}</p>
    </div>
  </motion.div>
);

/* ── Skeleton ─────────────────────────────────────────────────────── */
const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-100 rounded-xl ${className}`} />
);

/* ── Status colours ───────────────────────────────────────────────── */
const STATUS_STYLE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  received:   { bg: 'bg-amber-50 border border-amber-100',    text: 'text-amber-700',  dot: 'bg-amber-400',  label: 'Đã nhận' },
  washing:    { bg: 'bg-cyan-50 border border-cyan-100',      text: 'text-cyan-700',   dot: 'bg-cyan-400',   label: 'Đang giặt' },
  drying:     { bg: 'bg-orange-50 border border-orange-100',  text: 'text-orange-700', dot: 'bg-orange-400', label: 'Đang sấy' },
  delivering: { bg: 'bg-violet-50 border border-violet-100',  text: 'text-violet-700', dot: 'bg-violet-400', label: 'Đang giao' },
  completed:  { bg: 'bg-emerald-50 border border-emerald-100',text: 'text-emerald-700',dot: 'bg-emerald-400',label: 'Hoàn thành' },
  cancelled:  { bg: 'bg-rose-50 border border-rose-100',      text: 'text-rose-700',   dot: 'bg-rose-400',   label: 'Đã hủy' },
};

/* ══════════════════════════════════════════════════════════════════ */
export const OverviewTab: React.FC<OverviewTabProps> = ({ stats, isLoading }) => {

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="lg:col-span-2 h-72" />
          <Skeleton className="h-72" />
        </div>
        <Skeleton className="h-28" />
      </div>
    );
  }

  const s = stats;
  if (!s) return null;

  const kpiCards = [
    {
      label: 'Doanh thu tháng này',
      value: `${((s.revenue.thisMonth || 0) / 1_000_000).toFixed(1)}M ₫`,
      subtext: `Tháng trước: ${((s.revenue.lastMonth || 0) / 1_000_000).toFixed(1)}M ₫`,
      change: s.revenue.changePercent,
      icon: <DollarSign className="w-5 h-5 text-white" />,
      gradient: 'bg-gradient-to-br from-[#C5A880] to-[#8E6C3A]',
    },
    {
      label: 'Đơn hàng hôm nay',
      value: s.overview.todayOrders,
      subtext: 'Tổng tất cả dịch vụ',
      change: null,
      icon: <ShoppingBag className="w-5 h-5 text-white" />,
      gradient: 'bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8]',
    },
    {
      label: 'Đang xử lý',
      value: s.overview.activeOrders,
      subtext: 'Chờ nhận & đang giặt',
      change: null,
      icon: <Clock className="w-5 h-5 text-white" />,
      gradient: 'bg-gradient-to-br from-[#F59E0B] to-[#D97706]',
    },
    {
      label: 'Nhân viên trực',
      value: s.overview.activeStaffCount,
      subtext: 'Sẵn sàng phân công',
      change: null,
      icon: <Users className="w-5 h-5 text-white" />,
      gradient: 'bg-gradient-to-br from-[#10B981] to-[#059669]',
    },
  ];

  const totalOrders = s.ordersByStatus.reduce((sum, o) => sum + o.count, 0);

  return (
    <div className="space-y-5">

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <KpiCard key={i} {...card} delay={i * 0.07} />
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue trend */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <BarChart3 className="w-4 h-4 text-[#C5A880]" />
                <h4 className="text-sm font-bold text-slate-700">Xu hướng doanh thu</h4>
              </div>
              <p className="text-[11px] text-slate-400">Hiệu suất doanh số theo tuần</p>
            </div>
            <div className="flex items-center bg-slate-50 p-0.5 rounded-lg border border-slate-100">
              {['Ngày', 'Tháng', 'Năm'].map((m, i) => (
                <button key={m} className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                  i === 0 ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-700'
                }`}>{m}</button>
              ))}
            </div>
          </div>

          <svg viewBox="0 0 500 120" className="w-full h-36 overflow-visible">
            <defs>
              <linearGradient id="goldAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#C5A880" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#C5A880" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="goldLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor="#BCA374" />
                <stop offset="100%" stopColor="#D4AF37" />
              </linearGradient>
            </defs>
            {[20, 50, 80, 108].map(y => (
              <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            <path
              d="M 0 105 C 60 95, 100 70, 160 65 C 220 60, 260 38, 320 32 C 380 26, 430 14, 500 10 L 500 120 L 0 120 Z"
              fill="url(#goldAreaGrad)"
            />
            <path
              d="M 0 105 C 60 95, 100 70, 160 65 C 220 60, 260 38, 320 32 C 380 26, 430 14, 500 10"
              fill="none"
              stroke="url(#goldLineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {[[0,105],[160,65],[320,32],[500,10]].map(([cx,cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="5"  fill="#C5A880" opacity="0.2" />
                <circle cx={cx} cy={cy} r="3"  fill="#C5A880" stroke="#fff" strokeWidth="1.5" />
              </g>
            ))}
            {['T2','T3','T4','T5','T6','T7','CN'].map((lbl, i) => (
              <text key={lbl} x={i*83} y="118" fill="#94a3b8" fontSize="9" fontWeight="600" textAnchor="middle">
                {lbl}
              </text>
            ))}
          </svg>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-50">
            {[
              { label: 'Doanh thu đạt', value: `${((s.revenue.thisMonth||0)/1_000_000).toFixed(1)}M ₫`, pct: 75, color: 'bg-[#C5A880]' },
              { label: 'Đơn hôm nay',   value: `${s.overview.todayOrders} đơn`,                          pct: 90, color: 'bg-blue-500'  },
              { label: 'Hoàn thành',    value: `${s.ordersByStatus.find(o=>o.status==='completed')?.count||0} đơn`, pct: 85, color: 'bg-emerald-500' },
              { label: 'Tỉ lệ hủy',    value: `${s.ordersByStatus.find(o=>o.status==='cancelled')?.count||0} đơn`, pct: 5,  color: 'bg-rose-400' },
            ].map(m => (
              <div key={m.label} className="text-center space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
                <p className="text-sm font-extrabold text-slate-700">{m.value}</p>
                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${m.color} rounded-full`} style={{ width: `${m.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top services */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#C5A880]" />
            <h4 className="text-sm font-bold text-slate-700">Dịch vụ phổ biến</h4>
          </div>
          <p className="text-[11px] text-slate-400 mb-5">Top gói được đặt nhiều nhất</p>

          <div className="space-y-4 flex-1">
            {s.topServices.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">Chưa có dữ liệu</div>
            ) : (
              s.topServices.slice(0, 5).map((sv, idx) => {
                const maxCount = Math.max(...s.topServices.map(t => t.orderCount));
                const pct = maxCount > 0 ? (sv.orderCount / maxCount) * 100 : 0;
                const barColors = ['bg-[#C5A880]', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-400'];
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[130px]">{sv.name}</span>
                      <span className="text-slate-500 font-bold ml-2 flex-shrink-0">{sv.orderCount} đơn</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, delay: 0.4 + idx * 0.1 }}
                        className={`h-full ${barColors[idx % barColors.length]} rounded-full`}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{sv.revenue.toLocaleString('vi-VN')} ₫</p>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 mt-4 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-400 font-semibold">Từ đơn hàng hoàn thành</p>
          </div>
        </motion.div>
      </div>

      {/* ── Status distribution ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-[#C5A880]" />
          <h4 className="text-sm font-bold text-slate-700">Phân bố trạng thái đơn hàng</h4>
          {totalOrders > 0 && (
            <span className="ml-auto text-[10px] font-bold bg-slate-50 border border-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              Tổng {totalOrders} đơn
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {(s.ordersByStatus || []).map((item, idx) => {
            const cfg = STATUS_STYLE[item.status] ?? { bg:'bg-slate-50 border border-slate-200', text:'text-slate-600', dot:'bg-slate-400', label: item.status };
            const pct = totalOrders > 0 ? Math.round((item.count / totalOrders) * 100) : 0;
            return (
              <div key={idx} className={`${cfg.bg} rounded-xl p-3.5 text-center space-y-1.5 hover:shadow-sm transition-shadow`}>
                <div className="flex items-center justify-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                </div>
                <p className={`text-2xl font-black ${cfg.text} leading-none`}>{item.count}</p>
                <p className={`text-[10px] font-bold ${cfg.text} opacity-80 leading-tight`}>{cfg.label}</p>
                <p className={`text-[9px] font-semibold ${cfg.text} opacity-50`}>{pct}%</p>
              </div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
};
