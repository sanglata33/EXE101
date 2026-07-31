import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyOrders,
  getOrderById,
  type Order,
  ORDER_STATUS_LABELS,
} from '../api/orderService';
import {
  Package,
  Clock,
  Calendar,
  MapPin,
  Eye,
  Loader2,
  AlertCircle,
  Check,
  ShoppingBag,
  X,
  ChevronRight,
} from 'lucide-react';

/* ─── Timeline steps ───────────────────────────────────────────── */
const STEPS = [
  { key: 'received',   label: '📦 Đã nhận đơn',  desc: 'Hệ thống đã ghi nhận và đang phân công nhân viên lấy đồ.' },
  { key: 'washing',    label: '🫧 Đang giặt',     desc: 'Đồ giặt đang được phân loại và giặt sạch bằng công nghệ Skill-Up.' },
  { key: 'drying',     label: '🌬️ Đang sấy/ủi',  desc: 'Quần áo đang được sấy khô thơm và là phẳng tươm tất.' },
  { key: 'delivering', label: '🚚 Đang giao',     desc: 'Shipper đang trên đường giao trả đồ sạch tận nhà.' },
  { key: 'completed',  label: '✅ Hoàn thành',    desc: 'Đơn hàng đã được giao nhận thành công. Hẹn gặp lại bạn!' },
];

/* ─── Filter tabs ──────────────────────────────────────────────── */
const TABS: { key: string; label: string }[] = [
  { key: 'all',        label: 'Tất cả'       },
  { key: 'received',   label: 'Đã nhận'      },
  { key: 'washing',    label: 'Đang giặt'    },
  { key: 'drying',     label: 'Đang sấy/ủi'  },
  { key: 'delivering', label: 'Đang giao'    },
  { key: 'completed',  label: 'Hoàn thành'   },
  { key: 'cancelled',  label: 'Đã hủy'       },
];

/* ─── Status badge colours ─────────────────────────────────────── */
const STATUS_COLORS: Record<string, string> = {
  received:   'bg-blue-50   text-blue-700   border-blue-200',
  washing:    'bg-cyan-50   text-cyan-700   border-cyan-200',
  drying:     'bg-amber-50  text-amber-700  border-amber-200',
  delivering: 'bg-violet-50 text-violet-700 border-violet-200',
  completed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:  'bg-rose-50   text-rose-700   border-rose-200',
};

/* ═══════════════════════════════════════════════════════════════ */
export const Orders: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, isLoading, navigate]);

  /* ── orders ── */
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError,   setOrdersError]   = useState<string | null>(null);
  const [activeTab,     setActiveTab]     = useState<string>('all');

  /* ── detail modal ── */
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder,   setSelectedOrder]   = useState<Order | null>(null);
  const [selectedImages,  setSelectedImages]  = useState<any[]>([]);
  const [detailLoading,   setDetailLoading]   = useState(false);
  const [detailError,     setDetailError]     = useState<string | null>(null);

  /* fetch orders */
  useEffect(() => {
    if (!isAuthenticated) return;
    setOrdersLoading(true);
    getMyOrders({ limit: 100 })
      .then(res => setOrders(res.orders))
      .catch(() => setOrdersError('Không thể tải danh sách đơn hàng.'))
      .finally(() => setOrdersLoading(false));
  }, [isAuthenticated]);

  /* fetch detail when modal opens */
  useEffect(() => {
    if (!selectedOrderId) { setSelectedOrder(null); setSelectedImages([]); return; }
    setDetailLoading(true);
    setDetailError(null);
    getOrderById(selectedOrderId)
      .then(res => { setSelectedOrder(res.order); setSelectedImages(res.images ?? []); })
      .catch(() => setDetailError('Không thể tải chi tiết đơn hàng.'))
      .finally(() => setDetailLoading(false));
  }, [selectedOrderId]);

  /* tab count */
  const countFor = (key: string) =>
    key === 'all' ? orders.length : orders.filter(o => o.status === key).length;

  /* filtered list */
  const filteredOrders =
    activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  /* ── helper ── */
  const svcName = (ord: Order) =>
    typeof ord.service === 'object' ? ord.service.name : 'Dịch vụ giặt ủi';
  const svcUnit = (ord: Order) =>
    typeof ord.service === 'object' && ord.service.priceType === 'per_kg' ? 'kg' : 'món';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9]">
        <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin" />
      </div>
    );
  }

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <div className="min-h-screen bg-[#FCFBF9] pb-20">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-[#EBE3D5]/60 sticky top-20 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-[#C5A880]" />
              <h1 className="text-xl font-black text-[#2A2520] tracking-tight">Đơn hàng của tôi</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Quản lý lịch sử giặt ủi và theo dõi tiến trình đơn hàng.</p>
          </div>
          <Link
            to="/profile"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#C5A880] hover:text-[#BCA374] transition-colors"
          >
            ← Về hồ sơ
          </Link>
        </div>

        {/* ── Filter tabs ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0">
            {TABS.map(tab => {
              const count   = countFor(tab.key);
              const isActive = tab.key === activeTab;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex-shrink-0 px-4 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap
                    ${isActive
                      ? 'border-[#C5A880] text-[#C5A880]'
                      : 'border-transparent text-slate-400 hover:text-[#2A2520]'}
                  `}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-black
                      ${isActive ? 'bg-[#C5A880]/15 text-[#C5A880]' : 'bg-slate-100 text-slate-400'}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {ordersLoading ? (
          <div className="py-20 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin" />
            <p className="text-sm text-slate-400">Đang tải đơn hàng...</p>
          </div>

        ) : ordersError ? (
          <div className="py-16 text-center space-y-2">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <p className="text-sm font-semibold text-rose-500">{ordersError}</p>
          </div>

        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Package className="w-14 h-14 text-[#EBE3D5] mx-auto" />
            <div>
              <p className="font-bold text-[#2A2520]">
                {activeTab === 'all' ? 'Bạn chưa có đơn hàng nào' : 'Không có đơn nào trong mục này'}
              </p>
              <p className="text-slate-400 text-xs mt-1">Đặt lịch giặt ủi ngay để trải nghiệm dịch vụ!</p>
            </div>
            <Link to="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#BCA374] to-[#C5A880] text-white rounded-xl text-sm font-bold shadow-md">
              <ShoppingBag className="w-4 h-4" /> Đặt lịch ngay
            </Link>
          </div>

        ) : (
          <div className="space-y-3">
            {filteredOrders.map(ord => {
              const badge = STATUS_COLORS[ord.status] ?? 'bg-slate-50 text-slate-600 border-slate-200';
              return (
                <div
                  key={ord._id}
                  onClick={() => setSelectedOrderId(ord._id)}
                  className="bg-white border border-[#EBE3D5]/60 hover:border-[#C5A880]/50 hover:shadow-md rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer group transition-all duration-200"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-[#FAF6F0] border border-[#EBE3D5]/60 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6 text-[#C5A880]" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#2A2520] bg-[#FAF6F0] border border-[#EBE3D5] px-2 py-0.5 rounded-lg">
                        {ord.orderCode}
                      </span>
                      <span className={`text-[10px] font-bold border rounded-md px-2 py-0.5 ${badge}`}>
                        {ORDER_STATUS_LABELS[ord.status] ?? ord.status}
                      </span>
                    </div>

                    <p className="font-bold text-[#2A2520] text-sm truncate">
                      {svcName(ord)}
                      <span className="text-[#8F7E71] font-semibold ml-1">• {ord.quantity} {svcUnit(ord)}</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ord.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                      {ord.scheduledPickupTime && (
                        <span className="flex items-center gap-1 text-[#8F7E71]">
                          <Clock className="w-3 h-3" />
                          Hẹn lấy: {new Date(ord.scheduledPickupTime).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})} · {new Date(ord.scheduledPickupTime).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                      {ord.pickupAddress && (
                        <span className="flex items-center gap-1 truncate max-w-xs">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{ord.pickupAddress}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price + CTA */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-2 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thành tiền</p>
                      <p className="text-lg font-black text-[#C5A880]">{ord.totalPrice.toLocaleString('vi-VN')}đ</p>
                    </div>
                    <span className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-[#EBE3D5] group-hover:border-[#C5A880] group-hover:bg-[#FAF6F0] text-slate-400 group-hover:text-[#C5A880] transition-all">
                      <Eye className="w-3.5 h-3.5" /> Xem tiến trình
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════
          ORDER DETAIL MODAL
      ══════════════════════════════════════════ */}
      {selectedOrderId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setSelectedOrderId(null); }}
        >
          <div className="bg-white rounded-2xl border border-[#EBE3D5] w-full max-w-2xl flex flex-col max-h-[88vh] shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#EBE3D5]/50 bg-[#FAF6F0]/60 rounded-t-2xl flex-shrink-0">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Theo dõi tiến trình đơn hàng</p>
                <h3 className="font-mono font-bold text-lg text-[#C5A880] leading-tight">
                  {selectedOrder ? selectedOrder.orderCode : '—'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-[#2A2520] hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {detailLoading ? (
                <div className="py-20 flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin" />
                  <span className="text-xs text-slate-400 font-semibold">Đang tải thông tin đơn...</span>
                </div>

              ) : detailError ? (
                <div className="py-12 text-center text-rose-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-semibold">{detailError}</p>
                </div>

              ) : selectedOrder ? (
                <>
                  {/* Summary */}
                  <div className="bg-[#FAF6F0]/50 border border-[#EBE3D5]/60 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start pb-3 border-b border-[#EBE3D5]/30">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Dịch vụ</p>
                        <p className="font-bold text-[#2A2520] text-sm">{svcName(selectedOrder)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Số lượng</p>
                        <p className="font-bold text-[#2A2520] text-sm">
                          {selectedOrder.quantity} {svcUnit(selectedOrder)}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Tổng thanh toán</p>
                        <p className="font-black text-[#C5A880] text-base">{selectedOrder.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
                      </div>
                      <span className={`text-[10px] font-bold border rounded-lg px-2 py-0.5 ${STATUS_COLORS[selectedOrder.status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {ORDER_STATUS_LABELS[selectedOrder.status] ?? selectedOrder.status}
                      </span>
                    </div>
                    {selectedOrder.pickupAddress && (
                      <div className="pt-3 border-t border-[#EBE3D5]/30 flex items-start gap-2 text-xs text-[#5A4B40]">
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Địa chỉ giao nhận</p>
                          {selectedOrder.pickupAddress}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timeline — driven by real admin-set status */}
                  <div>
                    <h4 className="font-bold text-sm text-[#2A2520] flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-[#C5A880]" /> Tiến trình đơn hàng
                    </h4>

                    {selectedOrder.status === 'cancelled' ? (
                      <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                        <p className="font-bold">Đơn hàng đã bị hủy</p>
                        {selectedOrder.statusHistory?.at(-1)?.note && (
                          <p className="text-xs mt-1 text-rose-600">Lý do: "{selectedOrder.statusHistory.at(-1)!.note}"</p>
                        )}
                      </div>
                    ) : (
                      <div className="relative ml-3 pl-6 border-l-2 border-slate-100 space-y-5">
                        {STEPS.map((step, idx) => {
                          const curIdx      = STEPS.findIndex(s => s.key === selectedOrder.status);
                          const isCompleted = idx <= curIdx;
                          const isCurrent   = idx === curIdx;
                          const hist        = selectedOrder.statusHistory?.find(h => h.status === step.key);
                          return (
                            <div key={step.key} className="relative">
                              {/* dot */}
                              <div className={`absolute -left-[calc(1.5rem+2px)] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-black transition-all
                                ${isCurrent   ? 'bg-[#C5A880] border-[#C5A880] text-white scale-125 shadow-md'
                                  : isCompleted ? 'bg-white border-[#C5A880]'
                                  : 'bg-white border-slate-200'}`}>
                                {isCompleted && !isCurrent && <Check className="w-2.5 h-2.5 text-[#C5A880] stroke-[3]" />}
                                {isCurrent && <span className="text-white text-[7px] font-black">●</span>}
                              </div>

                              <h5 className={`font-bold text-sm leading-tight
                                ${isCurrent ? 'text-[#C5A880]' : isCompleted ? 'text-[#2A2520]' : 'text-slate-300'}`}>
                                {step.label}
                              </h5>
                              <p className={`text-[11px] mt-0.5 leading-relaxed
                                ${isCompleted ? 'text-[#756458]' : 'text-slate-300'}`}>
                                {step.desc}
                              </p>
                              {hist?.note && (
                                <p className="mt-1.5 text-[10px] text-[#5A4B40] bg-[#FAF6F0] border border-[#EBE3D5] rounded-lg px-2.5 py-1.5 italic">
                                  "{hist.note}"
                                </p>
                              )}
                              {hist && (
                                <p className="text-[9px] text-slate-400 mt-0.5">
                                  {new Date(hist.timestamp).toLocaleString('vi-VN')}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Verification photos */}
                  {selectedImages.length > 0 && (
                    <div>
                      <h4 className="font-bold text-sm text-[#2A2520] mb-3">Ảnh xác thực giao nhận</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedImages.map(img => (
                          <div key={img._id} className="relative rounded-xl overflow-hidden border border-slate-100">
                            <img src={img.imageUrl} alt="Verification" className="w-full h-36 object-cover" />
                            <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-[9px] font-bold text-center py-1.5">
                              {img.imageType === 'pickup' ? '📸 Ảnh lúc nhận đồ' : '📸 Ảnh giao hàng sạch'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#EBE3D5]/40 bg-[#FAF6F0]/30 rounded-b-2xl flex justify-end flex-shrink-0">
              <button
                onClick={() => setSelectedOrderId(null)}
                className="px-5 py-2 bg-[#C5A880] hover:bg-[#BCA374] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
