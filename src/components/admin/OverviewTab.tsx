import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Tag,
  BarChart3,
  Activity,
} from 'lucide-react';
import type { DashboardStats } from '../../api/adminService';

interface OverviewTabProps {
  stats: DashboardStats | null;
  isLoading: boolean;
}

/* ── Mini Sparkline Chart Component (SVG Line) ─────────────────── */
const Sparkline: React.FC<{ points: number[] }> = ({ points }) => {
  const width = 200;
  const height = 40;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathData = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - 4 - ((p - min) / range) * (height - 8);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="absolute bottom-0 left-0 right-0 h-10 w-full overflow-hidden">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <path
          d={pathData}
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

/* ── KPI Solid Card Component (CoreUI Style) ───────────────────── */
const StatCard: React.FC<{
  label: string;
  value: string | number;
  subtext: string;
  change?: number | null;
  icon: React.ReactNode;
  cardBg: string;
  points: number[];
  delay?: number;
}> = ({ label, value, subtext, change, icon, cardBg, points, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`relative overflow-hidden ${cardBg} text-white rounded-xl p-5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group`}
  >
    <div className="relative z-10 pb-8">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-2xl font-bold tracking-tight leading-none mb-1">{value}</h3>
          <p className="text-xs font-medium text-white/70">{label}</p>
        </div>
        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white/80">
        {change !== null && change !== undefined && (
          <span className="inline-flex items-center gap-0.5 font-bold">
            {change >= 0 ? `(+${change}%)` : `(${change}%)`}
            {change >= 0 ? (
              <TrendingUp className="w-3 h-3 text-white" />
            ) : (
              <TrendingDown className="w-3 h-3 text-white" />
            )}
          </span>
        )}
        <span className="opacity-70">{subtext}</span>
      </div>
    </div>

    {/* Sparkline chart at the bottom edge */}
    <Sparkline points={points} />
  </motion.div>
);

const SkeletonCard: React.FC = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
    <div className="flex items-start justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-3 w-16 bg-slate-100 rounded-full shimmer" />
        <div className="h-6 w-24 bg-slate-100 rounded-lg shimmer" />
      </div>
      <div className="w-9 h-9 bg-slate-100 rounded-lg shimmer flex-shrink-0" />
    </div>
    <div className="h-2 w-32 bg-slate-100 rounded-full shimmer" />
  </div>
);

export const OverviewTab: React.FC<OverviewTabProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-64 bg-white rounded-xl border border-slate-200 shimmer" />
          <div className="h-64 bg-white rounded-xl border border-slate-200 shimmer" />
        </div>
      </div>
    );
  }

  const s = stats;
  if (!s) return null;

  const statCards = [
    {
      label: 'Doanh thu tháng này',
      value: `${(s.revenue.thisMonth || 0).toLocaleString('vi-VN')} ₫`,
      subtext: `Tháng trước: ${(s.revenue.lastMonth || 0).toLocaleString('vi-VN')} ₫`,
      change: s.revenue.changePercent,
      icon: <DollarSign className="w-5 h-5 text-white" />,
      cardBg: 'bg-[#321fdb]', // CoreUI Primary Blue
      points: [10, 40, 20, 35, 25, 45, 15, 30, 20, 35],
    },
    {
      label: 'Đơn hôm nay',
      value: s.overview.todayOrders,
      subtext: 'Tổng tất cả dịch vụ',
      change: null,
      icon: <ShoppingBag className="w-5 h-5 text-white" />,
      cardBg: 'bg-[#39f]', // CoreUI Info Blue/Cyan
      points: [20, 15, 35, 10, 25, 30, 15, 40, 30, 45],
    },
    {
      label: 'Đang xử lý',
      value: s.overview.activeOrders,
      subtext: 'Chờ nhận & đang giặt',
      change: null,
      icon: <Clock className="w-5 h-5 text-white" />,
      cardBg: 'bg-[#f9b115]', // CoreUI Warning Yellow
      points: [10, 20, 15, 25, 20, 30, 25, 35, 28, 40],
    },
    {
      label: 'Nhân viên trực',
      value: s.overview.activeStaffCount,
      subtext: 'Sẵn sàng phân công',
      change: null,
      icon: <Users className="w-5 h-5 text-white" />,
      cardBg: 'bg-[#e55353]', // CoreUI Danger Red
      points: [30, 25, 20, 15, 10, 15, 20, 25, 30, 35],
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} delay={i * 0.07} />
        ))}
      </div>

      {/* ── Charts + Services Row ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-4 h-4 text-[#321fdb]" />
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Xu hướng doanh thu
                </h4>
              </div>
              <p className="text-xs text-slate-400">
                Biểu diễn hiệu suất doanh số bán hàng trong tuần
              </p>
            </div>
            {/* Filter buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              {['Ngày', 'Tháng', 'Năm'].map((mode, i) => (
                <button
                  key={mode}
                  className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
                    i === 0
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <svg viewBox="0 0 500 130" className="w-full h-36 overflow-visible">
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#321fdb" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#321fdb" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#321fdb" />
                <stop offset="100%" stopColor="#3f51b5" />
              </linearGradient>
            </defs>
            {/* Grid lines */}
            {[20, 50, 80, 110].map((y) => (
              <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="#f1f5f9" strokeWidth="1" />
            ))}
            {/* Area fill */}
            <path
              d="M 0 110 C 60 100, 100 80, 160 75 C 220 70, 260 45, 320 40 C 380 35, 430 22, 500 18 L 500 130 L 0 130 Z"
              fill="url(#areaGrad)"
            />
            {/* Line */}
            <path
              d="M 0 110 C 60 100, 100 80, 160 75 C 220 70, 260 45, 320 40 C 380 35, 430 22, 500 18"
              fill="none"
              stroke="url(#lineGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Data points */}
            {[
              [0, 110], [160, 75], [320, 40], [500, 18],
            ].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r="4" fill="#321fdb" stroke="#fff" strokeWidth="2" />
              </g>
            ))}
            {/* X-axis labels */}
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((label, i) => (
              <text
                key={label}
                x={i * 83}
                y="128"
                fill="#94a3b8"
                fontSize="9"
                fontWeight="600"
                textAnchor="middle"
              >
                {label}
              </text>
            ))}
          </svg>

          {/* Main Chart Footer Metrics (CoreUI Style) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-4 border-t border-slate-100 text-center">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doanh thu đạt</p>
              <h5 className="text-sm font-extrabold text-slate-800">
                {((s.revenue.thisMonth || 0) / 1000000).toFixed(1)}M ₫ <span className="text-[10px] text-slate-400 font-semibold">(75%)</span>
              </h5>
              <div className="w-16 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-[#321fdb] rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đơn hôm nay</p>
              <h5 className="text-sm font-extrabold text-slate-800">
                {s.overview.todayOrders} đơn <span className="text-[10px] text-slate-400 font-semibold">(90%)</span>
              </h5>
              <div className="w-16 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-[#39f] rounded-full" style={{ width: '90%' }} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đơn hoàn thành</p>
              <h5 className="text-sm font-extrabold text-slate-800">
                {s.ordersByStatus.find(o => o.status === 'completed')?.count || 0} đơn <span className="text-[10px] text-slate-400 font-semibold">(85%)</span>
              </h5>
              <div className="w-16 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-[#2eb85c] rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tỉ lệ hủy đơn</p>
              <h5 className="text-sm font-extrabold text-slate-800">
                {s.ordersByStatus.find(o => o.status === 'cancelled')?.count || 0} đơn <span className="text-[10px] text-slate-400 font-semibold">(Cực thấp)</span>
              </h5>
              <div className="w-16 h-1 bg-slate-100 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-[#e55353] rounded-full" style={{ width: '5%' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Services */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-4 h-4 text-violet-500" />
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Dịch vụ phổ biến
              </h4>
            </div>
            <p className="text-sm font-semibold text-slate-700 mb-4">
              Top gói dịch vụ được chọn nhiều
            </p>

            <div className="space-y-3">
              {s.topServices.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-slate-400">Chưa có dữ liệu dịch vụ</p>
                </div>
              ) : (
                s.topServices.map((sv, idx) => {
                  const maxCount = Math.max(...s.topServices.map((t) => t.orderCount));
                  const pct = maxCount > 0 ? (sv.orderCount / maxCount) * 100 : 0;
                  const colors = ['bg-[#321fdb]', 'bg-[#39f]', 'bg-[#f9b115]'];
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                          {sv.name}
                        </span>
                        <span className="text-slate-500 font-bold ml-2 flex-shrink-0">
                          {sv.orderCount} đơn
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.4 + idx * 0.1 }}
                          className={`h-full ${colors[idx % colors.length]} rounded-full`}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {sv.revenue.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <p className="text-[10px] font-semibold text-slate-400">
              Thống kê từ đơn hàng hoàn thành
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── Status Distribution Row ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-slate-400" />
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Phân bố trạng thái đơn hàng
          </h4>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {(s.ordersByStatus || []).map((item, idx) => {
            const colors: Record<string, { bg: string; text: string; dot: string }> = {
              received:   { bg: 'bg-amber-50 border-amber-100',    text: 'text-amber-700', dot: 'bg-amber-500' },
              washing:    { bg: 'bg-cyan-50 border-cyan-100',      text: 'text-cyan-700',  dot: 'bg-cyan-500' },
              drying:     { bg: 'bg-orange-50 border-orange-100',  text: 'text-orange-700',dot: 'bg-orange-500' },
              delivering: { bg: 'bg-purple-50 border-purple-100',  text: 'text-purple-700',dot: 'bg-purple-500' },
              completed:  { bg: 'bg-emerald-50 border-emerald-100',text: 'text-emerald-700',dot: 'bg-emerald-500' },
              cancelled:  { bg: 'bg-rose-50 border-rose-100',      text: 'text-rose-700',  dot: 'bg-rose-500' },
            };
            const cfg = colors[item.status] || { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' };
            return (
              <div
                key={idx}
                className={`${cfg.bg} border rounded-xl p-3 text-center transition-all hover:shadow-xs`}
              >
                <div className={`flex items-center justify-center gap-1.5 mb-1`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                </div>
                <p className={`text-xl font-bold ${cfg.text} leading-none`}>{item.count}</p>
                <p className={`text-[10px] font-semibold ${cfg.text} opacity-70 mt-1 leading-tight`}>
                  {item.label}
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
