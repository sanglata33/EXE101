/**
 * AdminDashboard.tsx — Trang quản lý đơn hàng cho Admin & Staff
 *
 * Kiến trúc: Shell + component-based architecture
 * - AdminSidebar   — Dark sidebar navigation
 * - OverviewTab    — Thống kê & biểu đồ
 * - OrdersTab      — Danh sách & lọc đơn hàng
 * - UsersTab       — Quản lý tài khoản (Admin only)
 * - OrderDetailDrawer — Slide-over chi tiết đơn
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useAdminOrders } from '../hooks/useAdminOrders';
import { adminService } from '../api/adminService';
import type {
  OrderStatus,
  OrderDetail,
  OrderImage,
  Staff,
  DashboardStats,
  AppUser,
} from '../api/adminService';
import {
  Loader,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  ArrowRight,
  Check,
  Shield,
} from 'lucide-react';

// ── Child Components ─────────────────────────────────────────────────────────
import { AdminSidebar, type AdminTab } from '../components/admin/AdminSidebar';
import { OverviewTab } from '../components/admin/OverviewTab';
import { OrdersTab } from '../components/admin/OrdersTab';
import { UsersTab } from '../components/admin/UsersTab';
import { OrderDetailDrawer } from '../components/admin/OrderDetailDrawer';

// ── Status config (shared label mapping) ────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string }> = {
  received:   { label: 'Đã nhận đơn' },
  washing:    { label: 'Đang giặt'   },
  drying:     { label: 'Đang sấy'    },
  delivering: { label: 'Đang giao'   },
  completed:  { label: 'Hoàn thành'  },
  cancelled:  { label: 'Đã hủy'      },
};

const ROLE_CONFIG = {
  admin:    { label: 'Quản trị viên', badge: 'bg-violet-50 text-violet-700 border border-violet-200', icon: '👑' },
  staff:    { label: 'Nhân viên',     badge: 'bg-sky-50 text-sky-700 border border-sky-200',          icon: '🧺' },
  customer: { label: 'Khách hàng',    badge: 'bg-slate-100 text-slate-600 border border-slate-200',   icon: '👤' },
} as const;

type UserRole = 'customer' | 'staff' | 'admin';

// ── Auth Guard ───────────────────────────────────────────────────────────────
const useAdminGuard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) navigate('/login', { replace: true });
      else if (user && user.role !== 'admin' && user.role !== 'staff')
        navigate('/', { replace: true });
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  return { user, isLoading };
};

// ── Main Component ───────────────────────────────────────────────────────────
export const AdminDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAdminGuard();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Orders from hook
  const {
    orders,
    loading,
    updating,
    total,
    currentPage,
    pageSize,
    statusFilter,
    searchText,
    setCurrentPage,
    setStatusFilter,
    setSearchText,
    handleUpdateStatus,
    refetch,
  } = useAdminOrders();

  // Order detail drawer
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [images, setImages] = useState<OrderImage[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status confirm modal
  const [confirmStatus, setConfirmStatus] = useState<{
    orderId: string;
    orderCode: string;
    currentStatus: OrderStatus;
    newStatus: OrderStatus;
  } | null>(null);
  const [statusNote, setStatusNote] = useState('');

  // Staff list
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  // Drawer notes
  const [newStaffNote, setNewStaffNote] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isSavingAdminNote, setIsSavingAdminNote] = useState(false);

  // User management
  const [users, setUsers] = useState<AppUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [userRoleFilter, setUserRoleFilter] = useState<UserRole | 'all'>('all');
  const [userSearch, setUserSearch] = useState('');
  const [userSearchInput, setUserSearchInput] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{
    userId: string;
    userName: string;
    currentRole: UserRole;
    newRole: UserRole;
  } | null>(null);
  const userPageSize = 15;

  // ── Fetch functions ──────────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchOrderDetail = useCallback(async (id: string) => {
    try {
      setDetailLoading(true);
      const res = await adminService.getOrderDetail(id);
      setDetail(res.order);
      setImages(res.images);
      setAdminNoteInput(res.order.adminNote || '');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể lấy chi tiết đơn hàng', 'error');
    } finally {
      setDetailLoading(false);
    }
  }, [showToast]);

  const fetchStaffList = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      setStaffLoading(true);
      const list = await adminService.getStaffList();
      setStaffList(list);
    } catch (err) {
      console.error('Failed to fetch staff list:', err);
    } finally {
      setStaffLoading(false);
    }
  }, [user]);

  const fetchUsers = useCallback(async (
    page = 1,
    roleFilter: UserRole | 'all' = 'all',
    search = ''
  ) => {
    if (user?.role !== 'admin') return;
    try {
      setUsersLoading(true);
      const result = await adminService.getAllUsers({
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: search.trim() || undefined,
        page,
        limit: userPageSize,
      });
      setUsers(result.users);
      setUsersTotal(result.total);
    } catch (err: any) {
      showToast('Không thể tải danh sách tài khoản', 'error');
    } finally {
      setUsersLoading(false);
    }
  }, [user, showToast]);

  // ── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchStats();
    if (user?.role === 'admin') fetchStaffList();
  }, [fetchStats, fetchStaffList, user]);

  useEffect(() => {
    if (activeTab === 'users' && user?.role === 'admin') {
      fetchUsers(userPage, userRoleFilter, userSearch);
    }
  }, [activeTab, userPage, userRoleFilter, userSearch, fetchUsers, user]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLogout = useCallback(async () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      try {
        await logout();
        navigate('/login');
      } catch (err) {
        console.error('Logout failed:', err);
      }
    }
  }, [logout, navigate]);

  const handleRefreshAll = useCallback(async () => {
    showToast('Đang làm mới dữ liệu...');
    await Promise.all([refetch(), fetchStats()]);
    if (selectedOrderId) await fetchOrderDetail(selectedOrderId);
  }, [refetch, fetchStats, selectedOrderId, fetchOrderDetail, showToast]);

  const handleOpenDetail = useCallback((id: string) => {
    setSelectedOrderId(id);
    fetchOrderDetail(id);
  }, [fetchOrderDetail]);

  const handleCloseDetail = useCallback(() => {
    setSelectedOrderId(null);
    setDetail(null);
    setImages([]);
  }, []);

  const executeStatusUpdate = async () => {
    if (!confirmStatus) return;
    const { orderId, newStatus } = confirmStatus;
    try {
      await handleUpdateStatus(orderId, newStatus);
      showToast(`Đã chuyển trạng thái sang "${STATUS_CONFIG[newStatus].label}"`);
      setConfirmStatus(null);
      setStatusNote('');
      fetchStats();
      if (selectedOrderId === orderId) fetchOrderDetail(orderId);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái!', 'error');
    }
  };

  const handleAssignStaff = async (staffId: string) => {
    if (!detail) return;
    try {
      setIsAssigning(true);
      await adminService.assignStaff(detail._id, staffId);
      showToast('Phân công nhân viên thành công!');
      fetchOrderDetail(detail._id);
      refetch();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể phân công nhân viên!', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAddStaffNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !newStaffNote.trim()) return;
    try {
      setIsAddingNote(true);
      const updatedNotes = await adminService.addStaffNote(detail._id, newStaffNote.trim());
      showToast('Thêm ghi chú thành công!');
      setDetail((prev) => (prev ? { ...prev, staffNotes: updatedNotes } : null));
      setNewStaffNote('');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Thêm ghi chú thất bại!', 'error');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleSaveAdminNote = async () => {
    if (!detail) return;
    try {
      setIsSavingAdminNote(true);
      const savedNote = await adminService.updateAdminNote(detail._id, adminNoteInput.trim());
      showToast('Lưu ghi chú Admin thành công!');
      setDetail((prev) => (prev ? { ...prev, adminNote: savedNote } : null));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể lưu ghi chú!', 'error');
    } finally {
      setIsSavingAdminNote(false);
    }
  };

  const handleUpdateRole = useCallback(async (userId: string, newRole: UserRole) => {
    try {
      setUpdatingUserId(userId);
      const updated = await adminService.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      showToast(`Đã cập nhật vai trò → "${ROLE_CONFIG[newRole].label}" thành công!`);
      setConfirmRoleChange(null);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể cập nhật vai trò!', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  }, [showToast]);

  const handleToggleUserStatus = useCallback(async (userId: string, isActive: boolean) => {
    try {
      setUpdatingUserId(userId);
      const updated = await adminService.updateUserStatus(userId, isActive);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
      showToast(isActive ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản!');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể cập nhật trạng thái!', 'error');
    } finally {
      setUpdatingUserId(null);
    }
  }, [showToast]);

  // Status count map for tab badges
  const statusCounts = useMemo(() => {
    if (!stats?.ordersByStatus) return {};
    return Object.fromEntries(
      stats.ordersByStatus.map((item) => [item.status, item.count])
    );
  }, [stats]);

  // ── Auth loading ─────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-semibold">
          <Loader className="w-5 h-5 animate-spin text-cyan-600" />
          <span>Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  // ── Page title by tab ────────────────────────────────────────────────────
  const tabTitles: Record<AdminTab, { title: string; sub: string }> = {
    overview: { title: 'Tổng quan', sub: 'Thống kê hoạt động hệ thống' },
    orders:   { title: 'Quản lý đơn hàng', sub: `${total} đơn hàng trong hệ thống` },
    users:    { title: 'Quản lý tài khoản', sub: 'Phân quyền và khóa tài khoản người dùng' },
  };

  const currentTitle = tabTitles[activeTab];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#ebedef] flex">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userRole={user?.role}
        userName={user?.name}
        onLogout={handleLogout}
        onRefresh={handleRefreshAll}
        isRefreshing={loading || statsLoading}
        orderBadge={stats?.overview.activeOrders}
      />

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 min-h-screen flex flex-col" style={{ marginLeft: '16rem', width: 'calc(100% - 16rem)' }}>
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-screen-2xl mx-auto w-full px-6 py-3 flex items-center justify-between">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="hover:text-slate-800 transition-colors cursor-pointer" onClick={() => setActiveTab('overview')}>Home</span>
              <span className="text-slate-300">/</span>
              <span className="hover:text-slate-800 transition-colors cursor-pointer" onClick={() => setActiveTab('overview')}>Dashboard</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold capitalize">{currentTitle.title}</span>
            </div>

            {/* User Info / Badge */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafc] border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#321fdb] animate-pulse" />
                <span>{user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#321fdb] flex items-center justify-center text-white text-xs font-bold shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 max-w-screen-2xl mx-auto w-full px-8 py-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <OverviewTab stats={stats} isLoading={statsLoading} />
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <OrdersTab
                  orders={orders}
                  loading={loading}
                  updating={updating}
                  total={total}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  statusFilter={statusFilter}
                  searchText={searchText}
                  statusCounts={statusCounts}
                  onPageChange={setCurrentPage}
                  onStatusFilter={setStatusFilter}
                  onSearch={setSearchText}
                  onOpenDetail={handleOpenDetail}
                  onUpdateStatus={handleUpdateStatus}
                  onConfirmStatus={setConfirmStatus}
                  selectedOrderId={selectedOrderId}
                />
              </motion.div>
            )}

            {activeTab === 'users' && user?.role === 'admin' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <UsersTab
                  users={users}
                  usersLoading={usersLoading}
                  usersTotal={usersTotal}
                  userPage={userPage}
                  userPageSize={userPageSize}
                  userRoleFilter={userRoleFilter}
                  userSearchInput={userSearchInput}
                  userSearch={userSearch}
                  updatingUserId={updatingUserId}
                  currentUserId={(user as any)?._id}
                  onRoleFilterChange={setUserRoleFilter}
                  onPageChange={setUserPage}
                  onSearchInputChange={setUserSearchInput}
                  onSearchSubmit={() => { setUserSearch(userSearchInput); setUserPage(1); }}
                  onSearchClear={() => { setUserSearchInput(''); setUserSearch(''); setUserPage(1); }}
                  onRoleChangeRequest={(userId, userName, currentRole, newRole) =>
                    setConfirmRoleChange({ userId, userName, currentRole, newRole })
                  }
                  onToggleUserStatus={handleToggleUserStatus}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Order Detail Drawer ──────────────────────────────────────────── */}
      <OrderDetailDrawer
        selectedOrderId={selectedOrderId}
        detail={detail}
        images={images}
        detailLoading={detailLoading}
        updating={updating}
        staffList={staffList}
        staffLoading={staffLoading}
        isAssigning={isAssigning}
        newStaffNote={newStaffNote}
        adminNoteInput={adminNoteInput}
        isAddingNote={isAddingNote}
        isSavingAdminNote={isSavingAdminNote}
        userRole={user?.role}
        onClose={handleCloseDetail}
        onRefresh={handleRefreshAll}
        onAssignStaff={handleAssignStaff}
        onAddStaffNote={handleAddStaffNoteSubmit}
        onStaffNoteChange={setNewStaffNote}
        onAdminNoteChange={setAdminNoteInput}
        onSaveAdminNote={handleSaveAdminNote}
        onConfirmStatus={setConfirmStatus}
      />

      {/* ── Status Update Confirm Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {confirmStatus && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950"
              onClick={() => { setConfirmStatus(null); setStatusNote(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative z-10 space-y-4 border border-slate-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Cập nhật trạng thái</h4>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Đơn #{confirmStatus.orderCode}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3 rounded-2xl text-xs font-bold">
                <span className="text-slate-500">{STATUS_CONFIG[confirmStatus.currentStatus]?.label}</span>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <span className="text-cyan-600">{STATUS_CONFIG[confirmStatus.newStatus]?.label}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Ghi chú (tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Lý do cập nhật (VD: Khách xác nhận, Đã giặt xong...)"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all placeholder-slate-400"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => { setConfirmStatus(null); setStatusNote(''); }}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={executeStatusUpdate}
                  disabled={updating}
                  className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-200/50"
                >
                  {updating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Role Change Confirm Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {confirmRoleChange && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setConfirmRoleChange(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-white rounded-3xl shadow-2xl p-7 border border-slate-200"
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Xác nhận thay đổi quyền</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Có hiệu lực ngay lập tức</p>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-4 space-y-2 mb-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tài khoản:</span>
                  <span className="font-bold text-slate-800">{confirmRoleChange.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vai trò cũ:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-lg text-xs ${ROLE_CONFIG[confirmRoleChange.currentRole].badge}`}>
                    {ROLE_CONFIG[confirmRoleChange.currentRole].icon} {ROLE_CONFIG[confirmRoleChange.currentRole].label}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Vai trò mới:</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-lg text-xs ${ROLE_CONFIG[confirmRoleChange.newRole].badge}`}>
                    {ROLE_CONFIG[confirmRoleChange.newRole].icon} {ROLE_CONFIG[confirmRoleChange.newRole].label}
                  </span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmRoleChange(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => handleUpdateRole(confirmRoleChange.userId, confirmRoleChange.newRole)}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Toast Notification ───────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            className="fixed top-5 right-5 z-[60] flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xl"
          >
            <div
              className={`p-2 rounded-xl ${
                toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-rose-50 text-rose-600'
              }`}
            >
              {toast.type === 'success' ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
            </div>
            <span className="text-sm font-semibold text-slate-700">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
