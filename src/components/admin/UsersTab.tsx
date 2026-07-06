import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Loader,
  Lock,
  Unlock,
  X,
} from 'lucide-react';
import type { AppUser } from '../../api/adminService';

type UserRole = 'customer' | 'staff' | 'admin';

const ROLE_CONFIG = {
  admin:    { label: 'Quản trị viên', badge: 'bg-violet-100 text-violet-800 border border-violet-200', icon: '👑', avatarBg: 'from-violet-500 to-purple-600' },
  staff:    { label: 'Nhân viên',     badge: 'bg-sky-100 text-sky-800 border border-sky-200',          icon: '🧺', avatarBg: 'from-sky-500 to-blue-600'    },
  customer: { label: 'Khách hàng',    badge: 'bg-slate-100 text-slate-800 border border-slate-200',   icon: '👤', avatarBg: 'from-slate-500 to-slate-600' },
} as const;

interface UsersTabProps {
  users: AppUser[];
  usersLoading: boolean;
  usersTotal: number;
  userPage: number;
  userPageSize: number;
  userRoleFilter: UserRole | 'all';
  userSearchInput: string;
  userSearch: string;
  updatingUserId: string | null;
  currentUserId?: string;
  onRoleFilterChange: (role: UserRole | 'all') => void;
  onPageChange: (page: number) => void;
  onSearchInputChange: (val: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  onRoleChangeRequest: (userId: string, userName: string, currentRole: UserRole, newRole: UserRole) => void;
  onToggleUserStatus: (userId: string, isActive: boolean) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({
  users,
  usersLoading,
  usersTotal,
  userPage,
  userPageSize,
  userRoleFilter,
  userSearchInput,
  userSearch,
  updatingUserId,
  currentUserId,
  onRoleFilterChange,
  onPageChange,
  onSearchInputChange,
  onSearchSubmit,
  onSearchClear,
  onRoleChangeRequest,
  onToggleUserStatus,
}) => {
  const userTotalPages = Math.ceil(usersTotal / userPageSize);

  const roleTabs: { value: UserRole | 'all'; label: string }[] = [
    { value: 'all', label: '👥 Tất cả' },
    { value: 'admin', label: '👑 Admin' },
    { value: 'staff', label: '🧺 Nhân viên' },
    { value: 'customer', label: '👤 Khách hàng' },
  ];

  return (
    <div className="space-y-4">
      {/* ── Filter Bar ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm space-y-3">
        {/* Role filter tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 flex-wrap">
            {roleTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { onRoleFilterChange(tab.value); onPageChange(1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  userRoleFilter === tab.value
                    ? 'bg-[#321fdb] text-white shadow-sm shadow-[#321fdb]/25'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl flex-shrink-0">
            Tổng: <span className="text-slate-700 font-bold">{usersTotal}</span> tài khoản
          </span>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo tên, email hoặc số điện thoại..."
              value={userSearchInput}
              onChange={(e) => onSearchInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#321fdb]/40 focus:bg-white transition-all font-medium placeholder-slate-400"
            />
          </div>
          <button
            onClick={onSearchSubmit}
            className="px-4 py-2.5 text-xs font-bold bg-[#321fdb] hover:bg-[#22179c] text-white rounded-xl transition-colors"
          >
            Tìm
          </button>
          {userSearch && (
            <button
              onClick={onSearchClear}
              className="p-2.5 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Users Table ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {['Họ tên', 'Liên hệ', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map(
                  (head, i) => (
                    <th
                      key={head}
                      className={`px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest ${
                        i === 1 ? 'hidden md:table-cell' :
                        i === 4 ? 'hidden lg:table-cell' :
                        i === 5 ? 'text-center' : ''
                      }`}
                    >
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersLoading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader className="w-7 h-7 animate-spin text-violet-500" />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Đang tải tài khoản...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                        <Users className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Không tìm thấy tài khoản
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const roleCfg = ROLE_CONFIG[u.role];
                  const isSelf = u._id === currentUserId;
                  const isUpdating = updatingUserId === u._id;

                  return (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`group transition-colors ${
                        !u.isActive ? 'opacity-60 bg-slate-50/30' : 'hover:bg-slate-50/70'
                      }`}
                    >
                      {/* Name */}
                      <td className="px-5 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full bg-gradient-to-br ${roleCfg.avatarBg} flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm`}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-800 flex items-center gap-1.5 leading-none">
                              {u.name}
                              {isSelf && (
                                <span className="text-[9px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded-md">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1 md:hidden">
                              {u.email || u.phone || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5 align-middle hidden md:table-cell">
                        <p className="text-xs text-slate-600 font-medium">{u.email || '—'}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{u.phone || '—'}</p>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-3.5 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${roleCfg.badge}`}
                        >
                          <span>{roleCfg.icon}</span>
                          {roleCfg.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 align-middle">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Đã khóa
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-5 py-3.5 align-middle text-xs text-slate-400 font-medium hidden lg:table-cell">
                        {new Date(u.createdAt).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 align-middle text-center">
                        {isSelf ? (
                          <span className="text-[11px] text-slate-400 italic">Tài khoản của bạn</span>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {/* Role selector */}
                            <select
                              value={u.role}
                              disabled={isUpdating}
                              onChange={(e) =>
                                onRoleChangeRequest(
                                  u._id,
                                  u.name,
                                  u.role,
                                  e.target.value as UserRole
                                )
                              }
                              className="text-[11px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#321fdb] cursor-pointer disabled:opacity-50"
                            >
                              <option value="customer">👤 Khách hàng</option>
                              <option value="staff">🧺 Nhân viên</option>
                              <option value="admin">👑 Quản trị viên</option>
                            </select>

                            {/* Lock / Unlock */}
                            <button
                              onClick={() => onToggleUserStatus(u._id, !u.isActive)}
                              disabled={isUpdating}
                              title={u.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                              className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
                                u.isActive
                                  ? 'text-rose-500 hover:bg-rose-50 hover:text-rose-600'
                                  : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-600'
                              }`}
                            >
                              {isUpdating ? (
                                <Loader className="w-4 h-4 animate-spin" />
                              ) : u.isActive ? (
                                <Lock className="w-4 h-4" />
                              ) : (
                                <Unlock className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {userTotalPages > 1 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              Trang <span className="text-slate-700 font-bold">{userPage}</span> / {userTotalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(Math.max(1, userPage - 1))}
                disabled={userPage <= 1}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-[#321fdb] hover:text-[#321fdb] disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: userTotalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-9 h-9 text-xs rounded-xl font-bold transition-all ${
                    p === userPage
                      ? 'bg-[#321fdb] text-white shadow-sm shadow-[#321fdb]/25'
                      : 'bg-white border border-slate-200 text-slate-500 hover:border-[#321fdb] hover:text-[#321fdb]'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => onPageChange(Math.min(userTotalPages, userPage + 1))}
                disabled={userPage >= userTotalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-[#321fdb] hover:text-[#321fdb] disabled:opacity-30 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
