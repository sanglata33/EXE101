import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders, getOrderById, type Order, ORDER_STATUS_LABELS } from '../api/orderService';
import { updateProfile } from '../api/authService';
import {
  Mail, Phone, MapPin, Package, Clock, Check,
  Edit3, Eye, Loader2, AlertCircle, Calendar,
  ShoppingBag, Award, ShieldCheck, CheckCircle2,
  X, Save,
} from 'lucide-react';

/* ─── Timeline steps (labels come from DB status keys) ────────────────────── */
const STEPS = [
  { key: 'received',   label: '📦 Đã nhận đơn',  desc: 'Hệ thống đã ghi nhận và đang phân công nhân viên lấy đồ.' },
  { key: 'washing',    label: '🫧 Đang giặt',     desc: 'Đồ giặt đang được phân loại và giặt sạch bằng công nghệ Skill-Up.' },
  { key: 'drying',     label: '🌬️ Đang sấy/ủi',  desc: 'Quần áo đang được sấy khô thơm và là phẳng tươm tất.' },
  { key: 'delivering', label: '🚚 Đang giao',     desc: 'Shipper đang trên đường giao trả đồ sạch tận nhà.' },
  { key: 'completed',  label: '✅ Hoàn thành',    desc: 'Đơn hàng đã được giao nhận thành công. Hẹn gặp lại bạn!' },
];

/* ─── Status badge colours ─────────────────────────────────────────────────── */
const STATUS_COLORS: Record<string, string> = {
  received:   'bg-blue-50   text-blue-700   border-blue-200',
  washing:    'bg-cyan-50   text-cyan-700   border-cyan-200',
  drying:     'bg-amber-50  text-amber-700  border-amber-200',
  delivering: 'bg-violet-50 text-violet-700 border-violet-200',
  completed:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:  'bg-rose-50   text-rose-700   border-rose-200',
};

/* ─── Derive membership tier from real order count / spending ──────────────── */
const getMemberTier = (orderCount: number, totalSpent: number) => {
  if (totalSpent >= 2_000_000 || orderCount >= 20) return { label: 'Hạng Vàng',  next: null,              nextLabel: null,         pct: 100 };
  if (totalSpent >= 500_000  || orderCount >= 5)  return { label: 'Hạng Bạc',   next: 2_000_000,          nextLabel: 'Hạng Vàng',  pct: Math.round((totalSpent / 2_000_000) * 100) };
  return                                                  { label: 'Thành Viên',  next: 500_000,            nextLabel: 'Hạng Bạc',   pct: Math.round((totalSpent / 500_000)   * 100) };
};

/* ═══════════════════════════════════════════════════════════════════════════ */
export const Profile: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  /* redirect */
  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, isLoading, navigate]);

  /* ── edit form ── */
  const [isEditing,     setIsEditing]     = useState(false);
  const [fullName,      setFullName]      = useState('');
  const [phone,         setPhone]         = useState('');
  const [address,       setAddress]       = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError,   setUpdateError]   = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  /* ── orders ── */
  const [orders,        setOrders]        = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError,   setOrdersError]   = useState<string | null>(null);

  /* ── order detail modal ── */
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder,   setSelectedOrder]   = useState<Order | null>(null);
  const [selectedImages,  setSelectedImages]  = useState<any[]>([]);
  const [detailLoading,   setDetailLoading]   = useState(false);
  const [detailError,     setDetailError]     = useState<string | null>(null);

  /* sync user → form fields */
  useEffect(() => {
    if (user) {
      setFullName(user.name    ?? '');
      setPhone(user.phone      ?? '');
      setAddress(user.address  ?? '');
    }
  }, [user]);

  /* fetch orders once */
  useEffect(() => {
    if (!isAuthenticated) return;
    setOrdersLoading(true);
    getMyOrders({ limit: 50 })
      .then(res => setOrders(res.orders))
      .catch(() => setOrdersError('Không thể tải danh sách đơn hàng.'))
      .finally(() => setOrdersLoading(false));
  }, [isAuthenticated]);

  /* fetch order detail when modal opens */
  useEffect(() => {
    if (!selectedOrderId) { setSelectedOrder(null); setSelectedImages([]); return; }
    setDetailLoading(true);
    setDetailError(null);
    getOrderById(selectedOrderId)
      .then(res => { setSelectedOrder(res.order); setSelectedImages(res.images ?? []); })
      .catch(() => setDetailError('Không thể tải chi tiết đơn hàng.'))
      .finally(() => setDetailLoading(false));
  }, [selectedOrderId]);

  /* save profile */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) { setUpdateError('Họ và tên không được để trống.'); return; }
    setUpdateLoading(true); setUpdateError(null);
    try {
      await updateProfile({ name: fullName.trim(), phone: phone.trim() || undefined, address: address.trim() || undefined });
      setUpdateSuccess(true); setIsEditing(false);
      setTimeout(() => setUpdateSuccess(false), 3500);
    } catch (err: any) {
      setUpdateError(err.response?.data?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally { setUpdateLoading(false); }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFullName(user?.name    ?? '');
    setPhone(user?.phone      ?? '');
    setAddress(user?.address  ?? '');
    setUpdateError(null);
  };

  /* profile completion % */
  const completionPct = 25 + (user?.email ? 25 : 0) + (user?.phone ? 25 : 0) + (user?.address ? 25 : 0);

  /* real membership tier from actual order data */
  const totalSpent = orders.filter(o => o && o.status !== 'cancelled').reduce((s, o) => s + (o.totalPrice ?? (o as any).totalAmount ?? 0), 0);
  const tier = getMemberTier(orders.length, totalSpent);

  /* ── Loading skeleton ── */
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-[#1E4DB7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── BANNER (full-width, flush) ── */}
      <div className="w-full bg-gradient-to-r from-[#0F2560] via-[#1E4DB7] to-[#2E62D4] relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/3  w-60 h-60 bg-[#D4AF37]/15 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar circle */}
          <div className="w-20 h-20 rounded-full border-4 border-white/80 bg-white/20 flex items-center justify-center text-3xl font-black text-white shadow-xl flex-shrink-0 select-none">
            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1 space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight leading-none">{user.name || 'Người dùng'}</h1>
              <span className="inline-block bg-white/25 border border-white/40 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {user.role === 'admin' ? 'Quản trị viên' : user.role === 'staff' ? 'Nhân viên' : 'Khách hàng'}
              </span>
            </div>
            <p className="text-white/75 text-sm">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-1 text-white/90 text-xs">
              <Award className="w-3.5 h-3.5 text-yellow-300" />
              <span>Thành viên Thân Thiết · {tier.label}</span>
            </div>
          </div>

          {/* CTA button — goes to /orders page */}
          <Link
            to="/orders"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 border border-white/50 text-white text-sm font-bold rounded-xl backdrop-blur-sm transition-all duration-200 shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
            Đơn hàng của tôi
          </Link>
        </div>
      </div>

      {/* ── PAGE BODY ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Success toast */}
        {updateSuccess && (
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Cập nhật hồ sơ thành công!
          </div>
        )}

        {/* ── 2-column grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* ╔═══════════ LEFT (4 cols) ═══════════╗ */}
          <div className="lg:col-span-4 space-y-5">

            {/* Membership tier card — data-driven, not hardcoded */}
            <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-blue-50">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hạng Thành Viên</h3>
                <Award className="w-4 h-4 text-[#1E4DB7]" />
              </div>

              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tổng chi tiêu</p>
              <p className="text-2xl font-black text-[#1E4DB7] mt-0.5 mb-1">
                {totalSpent.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-xs font-semibold text-slate-600 mb-4">{tier.label}</p>

              {tier.next && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-semibold text-slate-500">
                    <span>{tier.label}</span>
                    <span>{tier.nextLabel} ({tier.next.toLocaleString('vi-VN')}đ)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#1E4DB7] to-[#2E62D4] rounded-full transition-all"
                      style={{ width: `${Math.min(tier.pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Còn {(tier.next - totalSpent).toLocaleString('vi-VN')}đ nữa để lên {tier.nextLabel} và nhận ưu đãi thêm.
                  </p>
                </div>
              )}

              {!tier.next && (
                <p className="text-xs text-emerald-600 font-bold">🎉 Bạn đã đạt hạng cao nhất!</p>
              )}
            </div>

            {/* Profile completion */}
            <div className="bg-white border border-blue-100/60 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-blue-50">
                <h3 className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Độ Hoàn Thiện Hồ Sơ
                </h3>
                <span className="text-xs font-bold text-emerald-600">{completionPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
              </div>
              <ul className="space-y-2 text-xs">
                {[
                  { done: true,            label: 'Đã đăng ký tài khoản (+25%)' },
                  { done: !!user.email,    label: 'Xác minh Email chính chủ (+25%)' },
                  { done: !!user.phone,    label: 'Cập nhật số điện thoại (+25%)' },
                  { done: !!user.address,  label: 'Cập nhật địa chỉ nhận đồ (+25%)' },
                ].map(item => (
                  <li key={item.label} className={`flex items-center gap-2 ${item.done ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {item.done
                      ? <Check className="w-3.5 h-3.5 stroke-[3] flex-shrink-0" />
                      : <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0" />}
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>

          </div>
          {/* ╚═══════════ END LEFT ═══════════╝ */}

          {/* ╔═══════════ RIGHT (8 cols) ═══════════╗ */}
          <div className="lg:col-span-8 space-y-5">

            {/* ── Personal info ── */}
            <div className="bg-white border border-blue-100/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-blue-50">
                <h2 className="font-bold text-base text-[#2A2520]">Thông tin cá nhân</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 text-xs text-[#1E4DB7] hover:text-[#1A42A0] font-bold cursor-pointer transition-colors">
                    <Edit3 className="w-3.5 h-3.5" /> Chỉnh sửa
                  </button>
                )}
              </div>

              {updateError && (
                <div className="flex items-start gap-2 p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{updateError}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Họ và Tên</span>
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} disabled={updateLoading}
                        className="w-full px-3.5 py-2.5 border border-blue-100 focus:border-[#1E4DB7] focus:ring-2 focus:ring-[#1E4DB7]/15 rounded-xl text-sm text-[#2A2520] outline-none"
                        placeholder="Họ và Tên" />
                    </label>
                    <label className="block space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số điện thoại</span>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} disabled={updateLoading}
                        className="w-full px-3.5 py-2.5 border border-blue-100 focus:border-[#1E4DB7] focus:ring-2 focus:ring-[#1E4DB7]/15 rounded-xl text-sm text-[#2A2520] outline-none"
                        placeholder="0912 345 678" />
                    </label>
                  </div>
                  <label className="block space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Địa chỉ lấy & giao trả đồ</span>
                    <textarea value={address} onChange={e => setAddress(e.target.value)} disabled={updateLoading} rows={2}
                      className="w-full px-3.5 py-2.5 border border-blue-100 focus:border-[#1E4DB7] focus:ring-2 focus:ring-[#1E4DB7]/15 rounded-xl text-sm text-[#2A2520] outline-none resize-none"
                      placeholder="Số nhà, đường, phường/xã..." />
                  </label>
                  <div className="flex justify-end gap-2 pt-1">
                    <button type="button" onClick={cancelEdit} disabled={updateLoading}
                      className="flex items-center gap-1 px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer">
                      <X className="w-3.5 h-3.5" /> Hủy
                    </button>
                    <button type="submit" disabled={updateLoading}
                      className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#1E4DB7] to-[#2E62D4] hover:from-[#1A42A0] hover:to-[#1E4DB7] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer">
                      {updateLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5" /> Lưu thay đổi</>}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-[#1E4DB7] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                      <p className="text-sm font-semibold text-[#2A2520] break-all">{user.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-[#1E4DB7] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Số điện thoại</p>
                      <p className="text-sm font-semibold text-[#2A2520]">{user.phone || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:col-span-2 pt-4 border-t border-blue-50">
                    <MapPin className="w-4 h-4 text-[#1E4DB7] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Địa chỉ lấy & giao trả đồ</p>
                      <p className="text-sm font-semibold text-[#2A2520] leading-relaxed">{user.address || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Orders ── */}
            <div className="bg-white border border-blue-100/60 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-blue-50">
                <h2 className="font-bold text-base text-[#2A2520]">Lịch sử đơn hàng của tôi</h2>
                {!ordersLoading && (
                  <span className="text-[10px] bg-blue-50 border border-blue-200 text-[#1E4DB7] px-2.5 py-0.5 rounded-full font-bold">
                    {orders.length} đơn hàng
                  </span>
                )}
              </div>

              {ordersLoading ? (
                <div className="py-14 flex flex-col items-center gap-2 text-slate-400">
                  <Loader2 className="w-7 h-7 text-[#1E4DB7] animate-spin" />
                  <span className="text-xs">Đang tải danh sách đơn...</span>
                </div>
              ) : ordersError ? (
                <div className="py-10 text-center text-rose-500 space-y-1">
                  <AlertCircle className="w-7 h-7 mx-auto opacity-80" />
                  <p className="text-xs">{ordersError}</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="py-14 text-center space-y-4">
                  <Package className="w-12 h-12 text-slate-200 mx-auto" />
                  <div>
                    <p className="font-bold text-[#2A2520] text-sm">Bạn chưa có đơn hàng nào</p>
                    <p className="text-slate-400 text-xs mt-1">Đặt lịch giặt ủi ngay để trải nghiệm dịch vụ!</p>
                  </div>
                  <Link to="/products"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-[#1E4DB7] to-[#2E62D4] text-white rounded-xl text-xs font-bold shadow-md">
                    <ShoppingBag className="w-3.5 h-3.5" /> Đặt lịch dịch vụ
                  </Link>
                </div>
              ) : (
                /* ── Order list — click entire row to open modal ── */
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {orders.map(ord => {
                    const badgeCls = STATUS_COLORS[ord.status] ?? 'bg-slate-50 text-slate-700 border-slate-200';
                    const svcName  = typeof ord.service === 'object' && ord.service !== null ? ord.service.name : 'Dịch vụ giặt ủi';
                    const unit     = typeof ord.service === 'object' && ord.service !== null && ord.service.priceType === 'per_kg' ? 'kg' : 'món';
                    const priceVal = (ord.totalPrice ?? (ord as any).totalAmount ?? 0);
                    return (
                      <button
                        key={ord._id}
                        onClick={() => setSelectedOrderId(ord._id)}
                        className="w-full text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-blue-50 hover:border-[#1E4DB7]/60 hover:bg-blue-50/40 rounded-xl transition-all duration-200 cursor-pointer group"
                      >
                        {/* Left */}
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#2A2520] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
                              {ord.orderCode}
                            </span>
                            <span className={`text-[10px] font-bold border rounded px-1.5 py-0.5 ${badgeCls}`}>
                              {ORDER_STATUS_LABELS[ord.status] ?? ord.status}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-[#2A2520] truncate">
                            {svcName} <span className="text-slate-400 font-semibold">• {ord.quantity} {unit}</span>
                          </p>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ord.createdAt).toLocaleDateString('vi-VN')}</span>
                            {ord.scheduledPickupTime && (
                              <span className="flex items-center gap-1 text-slate-500">
                                <Clock className="w-3 h-3" />
                                Hẹn lấy: {new Date(ord.scheduledPickupTime).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})} · {new Date(ord.scheduledPickupTime).toLocaleDateString('vi-VN')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-end gap-2 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thành tiền</p>
                            <p className="text-base font-black text-[#C5A880]">{priceVal.toLocaleString('vi-VN')}đ</p>
                          </div>
                          <span className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold border border-[#EBE3D5] group-hover:border-[#C5A880] text-slate-400 group-hover:text-[#C5A880] rounded-lg transition-all">
                            <Eye className="w-3.5 h-3.5" /> Chi tiết
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
          {/* ╚═══════════ END RIGHT ═══════════╝ */}

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          ORDER DETAIL MODAL — only opens on click
      ═══════════════════════════════════════════════════ */}
      {selectedOrderId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setSelectedOrderId(null); }}
        >
          <div className="bg-white rounded-2xl border border-[#EBE3D5] w-full max-w-2xl flex flex-col max-h-[88vh] shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#EBE3D5]/50 bg-[#FAF6F0]/60 rounded-t-2xl flex-shrink-0">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tra cứu tiến trình đơn hàng</p>
                <h3 className="font-mono font-bold text-lg text-[#C5A880] leading-tight">
                  {selectedOrder ? selectedOrder.orderCode : '...'}
                </h3>
              </div>
              <button onClick={() => setSelectedOrderId(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-[#2A2520] hover:bg-slate-100 transition-all cursor-pointer">
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
                  {/* Summary card */}
                  <div className="bg-[#FAF6F0]/50 border border-[#EBE3D5]/60 rounded-xl p-4 space-y-3 text-sm">
                    <div className="flex justify-between items-start border-b border-[#EBE3D5]/30 pb-3">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Dịch vụ</p>
                        <p className="font-bold text-[#2A2520]">{typeof selectedOrder.service === 'object' ? selectedOrder.service.name : 'Dịch vụ giặt ủi'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Số lượng</p>
                        <p className="font-bold text-[#2A2520]">
                          {selectedOrder.quantity} {typeof selectedOrder.service === 'object' && selectedOrder.service.priceType === 'per_kg' ? 'kg' : 'món'}
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Tổng thanh toán</p>
                        <p className="font-black text-[#C5A880] text-base">{selectedOrder.totalPrice.toLocaleString('vi-VN')} VNĐ</p>
                      </div>
                      <span className={`text-[10px] font-bold border rounded-lg px-2 py-0.5 ${STATUS_COLORS[selectedOrder.status] ?? 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                        {ORDER_STATUS_LABELS[selectedOrder.status] ?? selectedOrder.status}
                      </span>
                    </div>
                    <div className="border-t border-[#EBE3D5]/30 pt-3 flex items-start gap-2 text-xs text-[#5A4B40]">
                      <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Địa chỉ giao nhận</p>
                        {selectedOrder.pickupAddress}
                      </div>
                    </div>
                  </div>

                  {/* Timeline — steps reflect real admin-set status */}
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
                              <div className={`absolute -left-[calc(1.5rem+2px)] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[7px] font-bold
                                ${isCurrent   ? 'bg-[#C5A880] border-[#C5A880] text-white scale-125 shadow-sm'
                                  : isCompleted ? 'bg-white border-[#C5A880] text-[#C5A880]'
                                  : 'bg-white border-slate-200 text-slate-300'}`}>
                                {idx + 1}
                              </div>
                              <h5 className={`font-bold text-sm ${isCurrent ? 'text-[#C5A880]' : isCompleted ? 'text-[#2A2520]' : 'text-slate-400'}`}>
                                {step.label}
                              </h5>
                              <p className="text-[11px] text-[#756458] mt-0.5 leading-relaxed">{step.desc}</p>
                              {hist?.note && (
                                <p className="mt-1 text-[10px] text-[#5A4B40] bg-[#FAF6F0] border border-[#EBE3D5] rounded-lg px-2.5 py-1.5 italic">"{hist.note}"</p>
                              )}
                              {hist && (
                                <p className="text-[9px] text-slate-400 mt-0.5">
                                  Cập nhật: {new Date(hist.timestamp).toLocaleString('vi-VN')}
                                </p>
                              )}

                              {/* Ảnh xác thực cho từng bước */}
                              {step.key === 'picked_up' && selectedImages.filter(img => img.imageType === 'pickup').length > 0 && (
                                <div className="mt-2 space-y-1">
                                  <span className="text-[10px] font-bold text-[#1E4DB7] uppercase tracking-wider block">📸 Ảnh lấy đồ:</span>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {selectedImages.filter(img => img.imageType === 'pickup').map(img => (
                                      <div key={img._id} className="rounded-lg overflow-hidden border border-blue-100">
                                        <img src={getImageUrl(img.imageUrl)} alt="Lấy đồ" className="w-full h-24 object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {step.key === 'weighed' && selectedOrder.weightImageUrl && (
                                <div className="mt-2 space-y-1">
                                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">⚖️ Ảnh chụp trên cân:</span>
                                  <div className="rounded-lg overflow-hidden border border-amber-200 max-w-[200px]">
                                    <img src={getImageUrl(selectedOrder.weightImageUrl)} alt="Cân đồ" className="w-full h-24 object-cover" />
                                  </div>
                                </div>
                              )}

                              {(step.key === 'washing' || step.key === 'drying') && selectedImages.filter(img => img.imageType === 'process').length > 0 && (
                                <div className="mt-2 space-y-1">
                                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">🫧 Ảnh quy trình giặt/sấy tại tiệm:</span>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {selectedImages.filter(img => img.imageType === 'process').map(img => (
                                      <div key={img._id} className="rounded-lg overflow-hidden border border-indigo-100">
                                        <img src={getImageUrl(img.imageUrl)} alt="Giặt sấy" className="w-full h-24 object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {step.key === 'completed' && selectedImages.filter(img => img.imageType === 'delivery').length > 0 && (
                                <div className="mt-2 space-y-1">
                                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">📸 Ảnh giao đồ:</span>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {selectedImages.filter(img => img.imageType === 'delivery').map(img => (
                                      <div key={img._id} className="rounded-lg overflow-hidden border border-emerald-100">
                                        <img src={getImageUrl(img.imageUrl)} alt="Giao đồ" className="w-full h-24 object-cover" />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#EBE3D5]/40 bg-[#FAF6F0]/30 rounded-b-2xl flex justify-end flex-shrink-0">
              <button onClick={() => setSelectedOrderId(null)}
                className="px-5 py-2 bg-[#C5A880] hover:bg-[#BCA374] text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md">
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
