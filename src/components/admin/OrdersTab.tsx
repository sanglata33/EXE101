import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Loader,
  ExternalLink,
  Filter,
  X,
} from 'lucide-react';
import type { Order, OrderStatus } from '../../api/adminService';

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badge: string; dot: string; text: string }
> = {
  received:   { label: 'Đã nhận đơn', badge: 'bg-amber-100 text-amber-800 border border-amber-200',    dot: 'bg-amber-500',   text: 'text-amber-800'   },
  washing:    { label: 'Đang giặt',   badge: 'bg-cyan-100 text-cyan-800 border border-cyan-200',       dot: 'bg-cyan-500',    text: 'text-cyan-800'    },
  drying:     { label: 'Đang sấy',    badge: 'bg-orange-100 text-orange-800 border border-orange-200', dot: 'bg-orange-500',  text: 'text-orange-800'  },
  delivering: { label: 'Đang giao',   badge: 'bg-purple-100 text-purple-800 border border-purple-200', dot: 'bg-purple-500',  text: 'text-purple-800'  },
  completed:  { label: 'Hoàn thành',  badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-800' },
  cancelled:  { label: 'Đã hủy',      badge: 'bg-rose-100 text-rose-800 border border-rose-200',       dot: 'bg-rose-500',    text: 'text-rose-800'    },
};

const STATUS_TABS: { value: OrderStatus | 'all'; label: string; emoji: string }[] = [
  { value: 'all',        label: 'Tất cả',    emoji: '' },
  { value: 'received',   label: 'Đã nhận',   emoji: '📦' },
  { value: 'washing',    label: 'Đang giặt', emoji: '🫧' },
  { value: 'drying',     label: 'Đang sấy',  emoji: '🌬️' },
  { value: 'delivering', label: 'Đang giao', emoji: '🚚' },
  { value: 'completed',  label: 'Hoàn thành',emoji: '✅' },
  { value: 'cancelled',  label: 'Đã hủy',    emoji: '❌' },
];

const ORDER_STATUS_LIST = Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
  value: value as OrderStatus,
  label: cfg.label,
}));

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-xs text-slate-400">{status}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
};

interface OrdersTabProps {
  orders: Order[];
  loading: boolean;
  updating: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  statusFilter?: OrderStatus;
  searchText: string;
  statusCounts?: Record<string, number>;
  onPageChange: (page: number) => void;
  onStatusFilter: (status: OrderStatus | undefined) => void;
  onSearch: (text: string) => void;
  onOpenDetail: (id: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onConfirmStatus: (info: {
    orderId: string;
    orderCode: string;
    currentStatus: OrderStatus;
    newStatus: OrderStatus;
  }) => void;
  selectedOrderId: string | null;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  loading,
  updating,
  total,
  currentPage,
  pageSize,
  statusFilter,
  searchText,
  statusCounts,
  onPageChange,
  onStatusFilter,
  onSearch,
  onOpenDetail,
  onConfirmStatus,
  selectedOrderId,
}) => {
  const [searchInput, setSearchInput] = React.useState(searchText);
  const totalPages = Math.ceil(total / pageSize);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearch('');
  };

  const handleTabChange = (status: OrderStatus | 'all') => {
    onPageChange(1);
    onStatusFilter(status === 'all' ? undefined : status);
  };

  return (
    <div className="space-y-4">
      {/* ── Header Bar ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 p-4 shadow-sm">
        {/* Status tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-3 mb-3 border-b border-slate-100 no-scrollbar">
          {STATUS_TABS.map((tab) => {
            const isActive =
              (tab.value === 'all' && statusFilter === undefined) ||
              statusFilter === tab.value;
            const count =
              tab.value !== 'all' && statusCounts
                ? statusCounts[tab.value] ?? 0
                : null;
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  isActive
                    ? 'bg-[#321fdb] text-white shadow-sm shadow-[#321fdb]/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {tab.emoji && <span>{tab.emoji}</span>}
                {tab.label}
                {count !== null && count > 0 && (
                  <span
                    className={`ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search + Filter row */}
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo mã đơn hoặc tên khách hàng..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#321fdb]/40 focus:bg-white transition-all font-medium placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 text-xs font-bold bg-[#321fdb] hover:bg-[#22179c] text-white rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              Lọc
            </button>
            {searchText && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-2.5 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                title="Xoá bộ lọc"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          <div className="text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl whitespace-nowrap flex-shrink-0">
            <span className="text-slate-700 font-bold">{total}</span> đơn hàng
          </div>
        </div>
      </div>

      {/* ── Orders Table ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80">
                {['Mã đơn', 'Khách hàng', 'Số điện thoại', 'Tổng tiền', 'Trạng thái', 'Thời gian', 'Thao tác'].map(
                  (head, i) => (
                    <th
                      key={head}
                      className={`px-5 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest ${
                        i === 3 ? 'text-right hidden sm:table-cell' :
                        i === 2 ? 'hidden md:table-cell' :
                        i === 5 ? 'hidden lg:table-cell' :
                        i === 6 ? 'text-center' : ''
                      }`}
                    >
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <motion.tr key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader className="w-8 h-8 animate-spin text-cyan-500" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Đang tải dữ liệu...
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                ) : orders.length === 0 ? (
                  <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                          <ShoppingBag className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Không tìm thấy đơn hàng nào
                        </p>
                      </div>
                    </td>
                  </motion.tr>
                ) : (
                  orders.map((order) => {
                    const isCancelled = order.status === 'cancelled';
                    const finalAmount = order.totalPrice || order.totalAmount || 0;
                    const isSelected = selectedOrderId === order._id;
                    return (
                      <motion.tr
                        key={order._id}
                        layoutId={`order-row-${order._id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`group cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/40'
                            : isCancelled
                            ? 'opacity-60 bg-slate-50/30'
                            : 'hover:bg-slate-50'
                        }`}
                        onClick={() => onOpenDetail(order._id)}
                      >
                        {/* Code */}
                        <td className="px-5 py-3.5 align-middle">
                          <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            #{order.orderCode}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-3.5 align-middle">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#321fdb]/10 flex items-center justify-center font-bold text-[11px] text-[#321fdb] flex-shrink-0 shadow-xs">
                              {(order.customer?.name || 'K').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-slate-800 group-hover:text-[#321fdb] transition-colors leading-none">
                                {order.customer?.name || 'Khách vãng lai'}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1 md:hidden">
                                {order.customer?.phone || '—'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-5 py-3.5 align-middle text-xs text-slate-500 font-medium hidden md:table-cell">
                          {order.customer?.phone || '—'}
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-3.5 align-middle text-right hidden sm:table-cell">
                          <span className="font-bold text-sm text-slate-800">
                            {finalAmount.toLocaleString('vi-VN')}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-0.5">₫</span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5 align-middle">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 align-middle text-xs text-slate-400 font-medium hidden lg:table-cell">
                          {new Date(order.createdAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        {/* Actions */}
                        <td
                          className="px-5 py-3.5 align-middle text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1.5">
                            <select
                              value={order.status}
                              disabled={updating || isCancelled || order.status === 'completed'}
                              onChange={(e) =>
                                onConfirmStatus({
                                  orderId: order._id,
                                  orderCode: order.orderCode,
                                  currentStatus: order.status,
                                  newStatus: e.target.value as OrderStatus,
                                })
                              }
                              className="text-[11px] font-semibold border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#321fdb] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {ORDER_STATUS_LIST.map((s) => (
                                <option key={s.value} value={s.value}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => onOpenDetail(order._id)}
                              title="Xem chi tiết"
                              className="p-1.5 text-slate-400 hover:text-[#321fdb] hover:bg-[#321fdb]/10 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* ── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">
              Trang{' '}
              <span className="text-slate-700 font-bold">{currentPage}</span> /{' '}
              {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-[#321fdb] hover:text-[#321fdb] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let page = i + 1;
                // For large page counts, show pages around current
                if (totalPages > 7) {
                  const start = Math.max(1, currentPage - 3);
                  const end = Math.min(totalPages, start + 6);
                  page = start + i;
                  if (page > end) return null;
                }
                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    disabled={loading}
                    className={`w-9 h-9 text-xs rounded-xl font-bold transition-all ${
                      page === currentPage
                        ? 'bg-[#321fdb] text-white shadow-sm shadow-[#321fdb]/25'
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-[#321fdb] hover:text-[#321fdb]'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-[#321fdb] hover:text-[#321fdb] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
