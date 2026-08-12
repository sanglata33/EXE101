import React from 'react';
import { motion } from 'framer-motion';
import logoImg from '../../assets/logo.png';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  LogOut,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export type AdminTab = 'overview' | 'orders' | 'users';

interface NavItem {
  id: AdminTab;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  badge?: number;
}

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  userRole?: string;
  userName?: string;
  onLogout: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  pendingCount?: number;
  orderBadge?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  userRole = 'admin',
  userName = 'Admin',
  onLogout,
  onRefresh,
  isRefreshing = false,
  pendingCount = 0,
  orderBadge,
}) => {
  const effectiveBadge = orderBadge !== undefined ? orderBadge : pendingCount;

  const NAV_ITEMS: NavItem[] = [
    {
      id: 'overview',
      label: 'Tổng quan',
      sublabel: 'Thống kê & doanh thu',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'orders',
      label: 'Quản lý đơn hàng',
      sublabel: 'Danh sách & cập nhật trạng thái',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: effectiveBadge,
    },
    {
      id: 'users',
      label: 'Quản lý người dùng',
      sublabel: 'Phân quyền & danh sách tài khoản',
      icon: <Users className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  const generalItems = NAV_ITEMS.filter(item => !item.adminOnly);
  const adminItems   = NAV_ITEMS.filter(item => item.adminOnly);

  const NavButton = ({ item }: { item: NavItem }) => {
    const isActive = activeTab === item.id;

    return (
      <motion.button
        key={item.id}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onTabChange(item.id)}
        className={`
          w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left font-medium
          relative overflow-hidden
          transition-all duration-200 group cursor-pointer
          ${isActive
            ? 'bg-gradient-to-r from-[#1E4DB7]/20 to-[#1E4DB7]/5 border border-[#1E4DB7]/30 text-[#1E4DB7]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}
        `}
      >
        {/* Active left bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#1E4DB7] rounded-r-full" />
        )}

        {/* Icon */}
        <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#1E4DB7]' : 'text-slate-500 group-hover:text-slate-300'}`}>
          {item.icon}
        </span>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-semibold leading-none mb-0.5 ${isActive ? 'text-[#1E4DB7]' : ''}`}>
            {item.label}
          </p>
          <p className={`text-[10px] leading-none ${isActive ? 'text-[#1E4DB7]/60' : 'text-slate-600 group-hover:text-slate-500'}`}>
            {item.sublabel}
          </p>
        </div>

        {/* Badge */}
        {item.badge !== undefined && item.badge > 0 && (
          <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-[#1E4DB7] text-white min-w-[20px] text-center">
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 hidden md:flex flex-col z-40"
      style={{ background: 'linear-gradient(180deg, #0F1117 0%, #141820 100%)' }}>

      {/* Subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1E4DB7]/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-[#1E4DB7]/10 blur-2xl pointer-events-none" />

      {/* ── Logo ── */}
      <div className="px-5 py-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-[#1E4DB7]/20 flex-shrink-0">
            <img src={logoImg} alt="Skill Up Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight leading-none">
              Skill <span className="text-[#1E4DB7]">Up</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-500 mt-0.5 uppercase tracking-widest">
              Admin Portal
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/5 mb-2" />

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 space-y-5 overflow-y-auto">
        {/* GENERAL */}
        <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em] px-4 mb-3">
            Chung
          </p>
          {generalItems.map(item => <NavButton key={item.id} item={item} />)}
        </div>

        {/* ADMIN ONLY */}
        {userRole === 'admin' && adminItems.length > 0 && (
          <div className="space-y-1">
            <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.15em] px-4 mb-3">
              Quản trị
            </p>
            {adminItems.map(item => <NavButton key={item.id} item={item} />)}
          </div>
        )}
      </nav>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/5" />

      {/* ── Footer: user card + actions ── */}
      <div className="px-3 py-4 space-y-2 flex-shrink-0">

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all text-xs font-semibold disabled:opacity-30 cursor-pointer group"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#1E4DB7]' : 'group-hover:text-slate-300'}`} />
          <span>{isRefreshing ? 'Đang làm mới...' : 'Làm mới dữ liệu'}</span>
        </button>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1A42A0] to-[#1E4DB7] flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow">
            {userName ? userName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate leading-none mb-0.5">
              {userName || 'Admin'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              {userRole === 'admin' ? (
                <><Sparkles className="w-2.5 h-2.5 text-[#1E4DB7]" /> Quản trị viên</>
              ) : (
                '🧺 Nhân viên'
              )}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-500 hover:text-rose-400 hover:bg-rose-500/8 transition-all text-xs font-semibold border border-transparent hover:border-rose-500/15 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
