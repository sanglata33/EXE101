import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trash2, ShoppingBag, ArrowRight, CheckCircle2, ChevronRight,
  MapPin, Phone, User, Calendar, CreditCard, AlertCircle, Loader2,
  Package, RefreshCw, WifiOff,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { getAllServices, type LaundryService } from '../api/serviceService';
import { createOrder } from '../api/orderService';

// ─── Helper: normalize chuỗi tiếng Việt ──────────────────────────────────────
const norm = (s: string) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();

// ─── Map product → service (dựa trên keyword) ────────────────────────────────
const PRODUCT_KEYWORDS: Record<string, string[]> = {
  'giat-say-nhanh':    ['giat say', 'tieu chuan', 'standard', 'say'],
  'giat-say-premium':  ['premium', 'nuoc hoa', 'cao cap', 'say'],
  'giat-hap-suit':     ['vest', 'suit', 'ao vest', 'hap'],
  'giat-hap-vay-cuoi': ['vay cuoi', 'cuoi', 'vay', 'hap'],
  'ui-phang-nhanh':    ['ui phang', 'ui'],
  'giat-giay-sneaker': ['giay', 'sneaker'],
  'giat-thu-bong':     ['thu bong', 'gau bong', 'bong'],
  'giat-nem-sofa':     ['nem', 'sofa', 've sinh', 'dem'],
};

const findService = (
  productId: string,
  productName: string,
  services: LaundryService[]
): LaundryService | null => {
  if (services.length === 0) return null;

  const keywords = PRODUCT_KEYWORDS[productId] ?? [norm(productName).split(' ')[0]];
  const normName  = norm(productName);

  // Pass 1: keyword map match
  for (const svc of services) {
    const ns = norm(svc.name);
    if (keywords.some((kw) => ns.includes(kw))) return svc;
  }

  // Pass 2: any word from product name in service name
  const words = normName.split(' ').filter((w) => w.length > 3);
  for (const svc of services) {
    const ns = norm(svc.name);
    if (words.some((w) => ns.includes(w))) return svc;
  }

  // Fallback: first service
  return services[0];
};

// ─── Component ────────────────────────────────────────────────────────────────
export const Cart: React.FC = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    shippingFee,
    cartTotal,
  } = useCart();

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Services state với retry
  const [services, setServices]             = useState<LaundryService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError]   = useState(false);

  // Form state
  const [address, setAddress]                 = useState('');
  const [phone, setPhone]                     = useState('');
  const [name, setName]                       = useState('');
  const [bookingDate, setBookingDate]         = useState('');
  const [paymentMethod, setPaymentMethod]     = useState('cod');

  // Order state
  const [isOrdered, setIsOrdered]             = useState(false);
  const [isSubmitting, setIsSubmitting]       = useState(false);
  const [orderError, setOrderError]           = useState<string | null>(null);
  const [orderedItems, setOrderedItems]       = useState<typeof cartItems>([]);
  const [orderTotal, setOrderTotal]           = useState(0);
  const [createdOrderCodes, setCreatedOrderCodes] = useState<string[]>([]);

  // ── Fetch services với retry ──────────────────────────────────────────────
  const fetchServices = useCallback(async (attempt = 1) => {
    setServicesLoading(true);
    setServicesError(false);
    try {
      const data = await getAllServices();
      setServices(data);
      setServicesError(false);
    } catch {
      if (attempt < 3) {
        // Auto retry sau 1.5s
        setTimeout(() => fetchServices(attempt + 1), 1500);
      } else {
        setServicesError(true);
      }
    } finally {
      setServicesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // ── Checkout ──────────────────────────────────────────────────────────────
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Nếu services chưa load được, thử lại lần cuối
    let activeServices = services;
    if (activeServices.length === 0) {
      try {
        setIsSubmitting(true);
        activeServices = await getAllServices();
        setServices(activeServices);
        setServicesError(false);
      } catch {
        setOrderError('Không thể kết nối đến server. Vui lòng thử làm mới trang và thử lại.');
        setIsSubmitting(false);
        return;
      }
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      const orderCodes: string[] = [];
      const failedItems: string[] = [];

      for (const item of cartItems) {
        const svc = findService(item.product.id, item.product.name, activeServices);

        if (!svc) {
          failedItems.push(item.product.name);
          continue;
        }

        try {
          const order = await createOrder({
            serviceId:           svc._id,
            quantity:            item.quantity,
            pickupAddress:       address,
            deliveryAddress:     address,
            scheduledPickupTime: bookingDate ? new Date(bookingDate).toISOString() : undefined,
            note: [
              `Dịch vụ: ${item.product.name}`,
              `Khách hàng: ${name}`,
              `SĐT: ${phone}`,
              `Thanh toán: ${paymentMethod === 'cod' ? 'Khi giao nhận' : 'Chuyển khoản'}`,
            ].join(' | '),
          });
          if (order.orderCode) orderCodes.push(order.orderCode);
        } catch (err: any) {
          failedItems.push(
            err?.response?.data?.message ?? `Lỗi tạo đơn "${item.product.name}"`
          );
        }
      }

      if (orderCodes.length === 0 && failedItems.length > 0) {
        setOrderError(`Không thể tạo đơn hàng: ${failedItems.join(', ')}. Vui lòng thử lại.`);
        return;
      }

      // Lưu snapshot
      setOrderedItems([...cartItems]);
      setOrderTotal(cartTotal);
      setCreatedOrderCodes(orderCodes);
      clearCart();
      setIsOrdered(true);
    } catch (err: any) {
      setOrderError(err?.response?.data?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Order success screen ──────────────────────────────────────────────────
  if (isOrdered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-36 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-xl"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">Đặt lịch thành công!</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Đơn hàng đã được gửi đến hệ thống. Nhân viên FreshWash sẽ liên hệ qua số điện thoại để xác nhận lấy đồ.
            </p>
          </div>

          {createdOrderCodes.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {createdOrderCodes.map((code) => (
                <span key={code} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-lg text-xs font-bold">
                  <Package className="w-3.5 h-3.5" />
                  {code}
                </span>
              ))}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs text-slate-700">
            <div className="flex justify-between">
              <span className="text-slate-500">Người nhận:</span>
              <span className="font-semibold text-slate-800">{name || 'Khách hàng'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Số điện thoại:</span>
              <span className="font-semibold text-slate-800">{phone || 'Chưa cung cấp'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Địa chỉ:</span>
              <span className="font-semibold text-slate-800 line-clamp-1">{address || 'Chưa cung cấp'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Ngày lấy đồ:</span>
              <span className="font-semibold text-slate-800">{bookingDate || 'Hôm nay'}</span>
            </div>

            {orderedItems.length > 0 && (
              <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
                <span className="text-slate-500 block mb-1.5 font-semibold">Dịch vụ đã đặt:</span>
                {orderedItems.map((item) => (
                  <div key={item.product.id} className="flex justify-between">
                    <span className="text-slate-600">{item.product.name} ×{item.quantity}</span>
                    <span className="font-semibold text-slate-800">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-1.5 pt-1.5 border-t border-slate-100">
                  <span className="font-bold text-slate-700">Tổng cộng:</span>
                  <span className="font-bold text-cyan-600">{formatPrice(orderTotal)}</span>
                </div>
              </div>
            )}
          </div>

          <Link to="/products" className="block">
            <Button variant="primary" fullWidth className="text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400">
              Tiếp Tục Chọn Dịch Vụ
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // ── Empty cart ────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-36 px-4 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-6 shadow-sm">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-slate-500 text-sm mb-8 max-w-xs">Hãy khám phá các gói dịch vụ giặt sấy chất lượng cao của chúng tôi ngay hôm nay.</p>
        <Link to="/products">
          <Button variant="primary" className="gap-2 text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400">
            Khám phá dịch vụ
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // ── Main cart ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pt-36 pb-24">
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <h1 className="font-display font-extrabold text-3xl text-slate-900 mb-10">
          Giỏ Hàng <span className="text-cyan-600">Dịch Vụ</span>
        </h1>

        {/* Services loading/error banner */}
        {servicesLoading && (
          <div className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-700 text-sm">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Đang kết nối đến server để chuẩn bị đặt hàng...</span>
          </div>
        )}

        {servicesError && !servicesLoading && (
          <div className="mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span>Không thể kết nối đến server. Bấm đặt lịch để thử lại tự động.</span>
            </div>
            <button
              onClick={() => fetchServices()}
              className="flex items-center gap-1 text-xs font-bold bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg transition-colors shrink-0"
            >
              <RefreshCw className="w-3 h-3" />
              Thử lại
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* ── Left: Cart Items ─────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-4">
            {cartItems.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Thumbnail + info */}
                <div className="flex gap-4 items-center min-w-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="text-[10px] text-cyan-600 uppercase font-bold tracking-wider block">
                      {item.product.categoryLabel}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base leading-snug">{item.product.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đơn giá: {formatPrice(item.product.price)}/{item.product.unit}
                    </p>
                  </div>
                </div>

                {/* Qty + Price + Delete */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  {/* Qty */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-all font-bold text-base"
                    >−</button>
                    <span className="w-8 text-center text-slate-800 text-sm font-bold select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-all font-bold text-base"
                    >+</button>
                  </div>

                  {/* Price */}
                  <span className="font-display font-bold text-slate-800 text-base w-28 text-right">
                    {formatPrice(item.product.price * item.quantity)}
                  </span>

                  {/* Delete */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* ── Right: Summary + Form ─────────────────────────────────────── */}
          <div className="lg:col-span-5 space-y-6">

            {/* Price summary */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-amber-500" />
              <div className="p-5 space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-800">Tóm Tắt Đơn Hàng</h3>
                <div className="space-y-2.5 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-slate-800">{formatPrice(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Phí giao nhận tận nơi</span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600 font-bold">Miễn phí</span>
                    ) : (
                      <span className="font-semibold text-slate-800">{formatPrice(shippingFee)}</span>
                    )}
                  </div>
                  {shippingFee > 0 && (
                    <p className="text-[10px] text-slate-400 italic">
                      * Miễn phí giao nhận cho đơn hàng từ {formatPrice(200000)}
                    </p>
                  )}
                </div>
                <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-slate-700 font-bold text-base">Tổng cộng</span>
                  <span className="font-display font-black text-2xl text-cyan-600">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout form */}
            <form onSubmit={handleCheckout} className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-cyan-500" />
              <div className="p-5 space-y-4">
                <h3 className="font-display font-bold text-lg text-slate-800">Thông Tin Giao Nhận</h3>

                <div className="space-y-3">
                  {/* Name */}
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input required type="text" placeholder="Họ và tên của bạn"
                      value={name} onChange={(e) => setName(e.target.value)} className="fw-input has-icon" />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input required type="tel" placeholder="Số điện thoại liên hệ"
                      value={phone} onChange={(e) => setPhone(e.target.value)} className="fw-input has-icon" />
                  </div>

                  {/* Address */}
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input required type="text" placeholder="Địa chỉ chi tiết để shipper đến lấy đồ"
                      value={address} onChange={(e) => setAddress(e.target.value)} className="fw-input has-icon" />
                  </div>

                  {/* Date */}
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input required type="date"
                      value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="fw-input has-icon min-w-0" />
                  </div>

                  {/* Payment */}
                  <div className="pt-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">
                      Hình thức thanh toán
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'cod',      label: 'Khi giao nhận' },
                        { value: 'transfer', label: 'Chuyển khoản'  },
                      ].map((opt) => (
                        <label key={opt.value} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                          paymentMethod === opt.value
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-600'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800'
                        }`}>
                          <input type="radio" name="payment" value={opt.value}
                            checked={paymentMethod === opt.value}
                            onChange={() => setPaymentMethod(opt.value)} className="sr-only" />
                          <CreditCard className="w-4 h-4 shrink-0" />
                          <span className="text-xs font-bold">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Not logged in warning */}
                {!isAuthenticated && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Bạn cần <Link to="/login" className="font-bold underline">đăng nhập</Link> để đặt hàng.</span>
                  </div>
                )}

                {/* Error */}
                {orderError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{orderError}</span>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  variant="secondary"
                  fullWidth
                  disabled={isSubmitting}
                  className="py-3 mt-2 gap-2 text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-md shadow-amber-500/20 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Đang gửi đơn hàng...</>
                  ) : servicesLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Đang kết nối server...</>
                  ) : (
                    <>Xác Nhận Đặt Lịch<ChevronRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};
