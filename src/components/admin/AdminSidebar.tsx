import React from 'react';
import { motion } from 'framer-motion';
import {
  Wind,
  LayoutDashboard,
  ShoppingBag,
  Users,
  LogOut,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export type AdminTab = 'overview' | 'orders' | 'users';

interface NavItem {
  id: AdminTab;
  label: string;
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
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'orders',
      label: 'Đơn hàng',
      icon: <ShoppingBag className="w-5 h-5" />,
      badge: orderBadge,
    },
    {
      id: 'users',
      label: 'Tài khoản',
      icon: <Users className="w-5 h-5" />,
      adminOnly: true,
    },
  ];

  const generalItems = navItems.filter((item) => item.id === 'overview' || item.id === 'orders');
  const adminItems = navItems.filter((item) => item.id === 'users');

  const renderNavButton = (item: NavItem) => {
    const isActive = activeTab === item.id;
    return (
      <motion.button
        key={item.id}
        onClick={() => onTabChange(item.id)}
        whileHover={{ x: 3 }}
        whileTap={{ scale: 0.98 }}
        className={`relative w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 group ${
          isActive
            ? 'bg-[#321fdb] text-white shadow-md shadow-[#321fdb]/20'
            : 'text-[#8a93a2] hover:text-white hover:bg-[#3c4b64]/30'
        }`}
      >
        <span
          className={`flex-shrink-0 transition-colors ${
            isActive ? 'text-white' : 'text-[#8a93a2] group-hover:text-white'
          }`}
        >
          {item.icon}
        </span>

        <span className="flex-1 text-left">{item.label}</span>

        {/* Badge count */}
        {item.badge !== undefined && item.badge > 0 && (
          <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
            isActive ? 'bg-white/25 text-white' : 'bg-[#321fdb] text-white'
          }`}>
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}

        {/* Chevron for active */}
        {isActive && (
          <ChevronRight className="w-3.5 h-3.5 text-white/70 flex-shrink-0" />
        )}
      </motion.button>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#212631] border-r border-[#3c4b64]/20 hidden md:flex flex-col z-40 shadow-xl">
      {/* ── Logo & Brand ───────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-[#3c4b64]/20 bg-[#1d222b]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#321fdb] flex items-center justify-center shadow-lg shadow-[#321fdb]/30 flex-shrink-0">
            <Wind className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              FreshWash
            </h1>
            <p className="text-[10px] font-semibold text-[#8a93a2] mt-0.5 uppercase tracking-widest">
              CoreUI Admin
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation Items ───────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {/* GENERAL SECTION */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-[#8a93a2]/50 uppercase tracking-widest px-4 mb-2">
            CHUNG (GENERAL)
          </p>
          {generalItems.map(renderNavButton)}
        </div>

        {/* MANAGEMENT SECTION (Admin only) */}
        {userRole === 'admin' && adminItems.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-[#8a93a2]/50 uppercase tracking-widest px-4 mb-2">
              QUẢN TRỊ (ADMIN)
            </p>
            {adminItems.map(renderNavButton)}
          </div>
        )}
      </nav>

      {/* ── User Info & Actions ────────────────────────────────────────── */}
      <div className="px-3 py-4 border-t border-[#3c4b64]/20 bg-[#1d222b] space-y-2">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#8a93a2] hover:text-white hover:bg-[#3c4b64]/30 transition-all text-xs font-semibold disabled:opacity-40"
        >
          <RefreshCw
            className={`w-4 h-4 text-[#8a93a2] ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>Làm mới dữ liệu</span>
        </button>

        {/* User profile card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#212631] border border-[#3c4b64]/20">
          <div className="w-8 h-8 rounded-lg bg-[#321fdb] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
            {userName ? userName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate leading-none mb-0.5">
              {userName || 'Admin'}
            </p>
            <p className="text-[10px] text-[#8a93a2] font-medium capitalize">
              {userRole === 'admin' ? '👑 Quản trị viên' : '🧺 Nhân viên'}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all text-xs font-semibold border border-transparent hover:border-rose-500/20"
        >
          <LogOut className="w-4 h-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};

