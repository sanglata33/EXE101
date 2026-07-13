import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trash2, ShoppingBag, ArrowRight, CheckCircle2, ChevronRight,
  MapPin, Phone, User, Calendar, CreditCard, AlertCircle, Loader2, Package,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { getAllServices, type LaundryService } from '../api/serviceService';
import { createOrder } from '../api/orderService';

// ─── Helper: map product slug/name → backend serviceId ────────────────────────
/**
 * Cố gắng tìm service tương ứng với product dựa trên tên.
 * Thuật toán: lowercase + bỏ dấu + so sánh từ khóa chính.
 */
const normalizeStr = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();

const findMatchingService = (
  productName: string,
  productId: string,
  services: LaundryService[]
): LaundryService | null => {
  if (services.length === 0) return null;

  const normProduct = normalizeStr(productName);
  const normId      = normalizeStr(productId);

  // Keywords map từ product slug → service keywords
  const KEYWORD_MAP: Record<string, string[]> = {
    'giat-say-nhanh':   ['giat say', 'giat say', 'tieu chuan', 'standard'],
    'giat-say-premium': ['premium', 'nuoc hoa', 'cao cap'],
    'giat-hap-suit':    ['vest', 'suit', 'ao vest'],
    'giat-hap-vay-cuoi':['vay cuoi', 'cuoi'],
    'ui-phang-nhanh':   ['ui phang', 'ui'],
    'giat-giay-sneaker':['giay', 'sneaker'],
    'giat-thu-bong':    ['thu bong', 'gau bong'],
    'giat-nem-sofa':    ['nem', 'sofa', 've sinh'],
  };

  const keywords = KEYWORD_MAP[normId] || [normProduct.split(' ').slice(0, 2).join(' ')];

  // Tìm service khớp keyword
  for (const svc of services) {
    const normSvc = normalizeStr(svc.name);
    if (keywords.some((kw) => normSvc.includes(kw) || kw.includes(normSvc.split(' ')[0]))) {
      return svc;
    }
  }

  // Fallback: service đầu tiên
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

  // Services từ backend
  const [services, setServices] = useState<LaundryService[]>([]);

  // Form state
  const [address, setAddress]           = useState('');
  const [phone, setPhone]               = useState('');
  const [name, setName]                 = useState('');
  const [bookingDate, setBookingDate]   = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // UI state
  const [isOrdered, setIsOrdered]       = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError]     = useState<string | null>(null);
  const [orderedItems, setOrderedItems] = useState<typeof cartItems>([]);
  const [orderTotal, setOrderTotal]     = useState(0);
  const [createdOrderCodes, setCreatedOrderCodes] = useState<string[]>([]);

  // Fetch services khi mount để có serviceId thật cho checkout
  useEffect(() => {
    getAllServices()
      .then(setServices)
      .catch(() => {}); // silently ignore — fallback sẽ xử lý
  }, []);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // ── Checkout Handler ─────────────────────────────────────────────────────────
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      const orderCodes: string[] = [];
      const errors: string[] = [];

      // Tạo đơn hàng cho từng item trong giỏ
      for (const item of cartItems) {
        const matchedService = findMatchingService(item.product.name, item.product.id, services);

        if (!matchedService) {
          errors.push(`Không tìm thấy dịch vụ cho "${item.product.name}"`);
          continue;
        }

        try {
          const order = await createOrder({
            serviceId:           matchedService._id,
            quantity:            item.quantity,
            pickupAddress:       address,
            deliveryAddress:     address,
            scheduledPickupTime: bookingDate ? new Date(bookingDate).toISOString() : undefined,
            note: `Tên KH: ${name} | SĐT: ${phone} | Thanh toán: ${paymentMethod === 'cod' ? 'Khi giao nhận' : 'Chuyển khoản'} | Dịch vụ gốc: ${item.product.name}`,
          });
          if (order.orderCode) orderCodes.push(order.orderCode);
        } catch (itemErr: any) {
          errors.push(
            itemErr?.response?.data?.message ||
            `Lỗi tạo đơn cho "${item.product.name}"`
          );
        }
      }

      if (errors.length > 0 && orderCodes.length === 0) {
        // Tất cả item đều lỗi
        setOrderError(errors.join('. '));
        return;
      }

      // Lưu snapshot trước khi clear
      setOrderedItems([...cartItems]);
      setOrderTotal(cartTotal);
      setCreatedOrderCodes(orderCodes);

      // Xóa giỏ hàng và hiện màn hình thành công
      clearCart();
      setIsOrdered(true);
    } catch (err: any) {
      setOrderError(
        err?.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Order success screen ─────────────────────────────────────────────────────
  if (isOrdered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-32 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-xl"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">Đặt lịch thành công!</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Đơn hàng đã được gửi đến hệ thống. Nhân viên FreshWash sẽ liên hệ qua số điện thoại để xác nhận lấy đồ.
            </p>
          </div>

          {/* Order codes */}
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

          {/* Summary */}
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

  // ── Empty cart ───────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-32 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-6 shadow-sm">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-slate-500 text-sm mb-8 max-w-xs">Hãy khám phá các gói dịch vụ giặt sấy chất lượng cao của chúng tôi ngay hôm nay.</p>
        <Link to="/products">
          <Button variant="primary" className="gap-2 text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400">
            Khám phá dịch vụ
            <ArrowRight className="w-4.5 h-4.5" />
          </Button>
        </Link>
      </div>
    );
  }

  // ── Main cart page ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Title */}
        <h1 className="font-display font-extrabold text-3xl text-slate-900 mb-10">
          Giỏ Hàng <span className="text-cyan-600">Dịch Vụ</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left Column: Cart Items */}
          <div className="lg:col-span-7 space-y-4">
            {cartItems.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Thumbnail + info */}
                <div className="flex gap-4 items-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                  />
                  <div>
                    <span className="text-[10px] text-cyan-600 uppercase font-bold tracking-wider block">
                      {item.product.categoryLabel}
                    </span>
                    <h3 className="font-bold text-slate-800 text-base leading-snug">{item.product.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đơn giá: {formatPrice(item.product.price)}/{item.product.unit}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Qty */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-all font-bold"
                    >-</button>
                    <span className="w-8 text-center text-slate-800 text-xs font-bold select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-all font-bold"
                    >+</button>
                  </div>

                  {/* Price + delete */}
                  <div className="flex items-center gap-4">
                    <span className="font-display font-bold text-slate-800 text-base sm:w-24 text-right">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right Column: Summary + Form */}
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
                    <input
                      required
                      type="text"
                      placeholder="Họ và tên của bạn"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="fw-input has-icon"
                    />
                  </div>

                  {/* Phone */}
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input
                      required
                      type="tel"
                      placeholder="Số điện thoại liên hệ"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="fw-input has-icon"
                    />
                  </div>

                  {/* Address */}
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input
                      required
                      type="text"
                      placeholder="Địa chỉ chi tiết để shipper đến lấy đồ"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="fw-input has-icon"
                    />
                  </div>

                  {/* Date */}
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input
                      required
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="fw-input has-icon min-w-0"
                    />
                  </div>

                  {/* Payment method */}
                  <div className="pt-2">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">
                      Hình thức thanh toán
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'cod',      label: 'Khi giao nhận' },
                        { value: 'transfer', label: 'Chuyển khoản'  },
                      ].map((opt) => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                            paymentMethod === opt.value
                              ? 'border-cyan-500 bg-cyan-50 text-cyan-600'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={opt.value}
                            checked={paymentMethod === opt.value}
                            onChange={() => setPaymentMethod(opt.value)}
                            className="sr-only"
                          />
                          <CreditCard className="w-4 h-4" />
                          <span className="text-xs font-bold">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Warning: not logged in */}
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
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang gửi đơn hàng...
                    </>
                  ) : (
                    <>
                      Xác Nhận Đặt Lịch
                      <ChevronRight className="w-4 h-4" />
                    </>
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
