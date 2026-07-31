import React from 'react';
import { motion } from 'framer-motion';
import {
  Wind,
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
  orderBadge?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  userRole,
  userName,
  onLogout,
  onRefresh,
  isRefreshing,
  orderBadge,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Tổng quan',
      sublabel: 'Dashboard & thống kê',
      icon: <LayoutDashboard className="w-4.5 h-4.5" />,
    },
    {
      id: 'orders',
      label: 'Đơn hàng',
      sublabel: 'Quản lý & theo dõi',
      icon: <ShoppingBag className="w-4.5 h-4.5" />,
      badge: orderBadge,
    },
    {
      id: 'users',
      label: 'Tài khoản',
      sublabel: 'Quản trị người dùng',
      icon: <Users className="w-4.5 h-4.5" />,
      adminOnly: true,
    },
  ];

  const generalItems = navItems.filter(item => !item.adminOnly);
  const adminItems   = navItems.filter(item => item.adminOnly);

  const NavButton = ({ item }: { item: NavItem }) => {
    const isActive = activeTab === item.id;
    return (
      <motion.button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        whileTap={{ scale: 0.98 }}
        className={`
          relative w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-left
          transition-all duration-200 group cursor-pointer
          ${isActive
            ? 'bg-gradient-to-r from-[#C5A880]/20 to-[#C5A880]/5 border border-[#C5A880]/30 text-[#C5A880]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}
        `}
      >
        {/* Active left bar */}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#C5A880] rounded-r-full" />
        )}

        {/* Icon */}
        <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-[#C5A880]' : 'text-slate-500 group-hover:text-slate-300'}`}>
          {item.icon}
        </span>

        {/* Label */}
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-semibold leading-none mb-0.5 ${isActive ? 'text-[#C5A880]' : ''}`}>
            {item.label}
          </p>
          <p className={`text-[10px] leading-none ${isActive ? 'text-[#C5A880]/60' : 'text-slate-600 group-hover:text-slate-500'}`}>
            {item.sublabel}
          </p>
        </div>

        {/* Badge */}
        {item.badge !== undefined && item.badge > 0 && (
          <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full bg-[#C5A880] text-white min-w-[20px] text-center">
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
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A880]/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-[#C5A880]/5 blur-2xl pointer-events-none" />

      {/* ── Logo ── */}
      <div className="px-5 py-5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C5A880] to-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#C5A880]/20 flex-shrink-0">
            <Wind className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight leading-none">
              Skill-<span className="text-[#C5A880]">Up</span>
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
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#C5A880]' : 'group-hover:text-slate-300'}`} />
          <span>{isRefreshing ? 'Đang làm mới...' : 'Làm mới dữ liệu'}</span>
        </button>

        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C5A880] to-[#D4AF37] flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow">
            {userName ? userName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate leading-none mb-0.5">
              {userName || 'Admin'}
            </p>
            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
              {userRole === 'admin' ? (
                <><Sparkles className="w-2.5 h-2.5 text-[#C5A880]" /> Quản trị viên</>
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
