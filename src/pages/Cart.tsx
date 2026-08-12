import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Trash2, ShoppingBag, ArrowRight, CheckCircle2, ChevronRight,
  MapPin, Phone, User, Calendar, AlertCircle, Loader2,
  RefreshCw, ServerCrash, Clock, FileText, Plus, Minus,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import type { LaundryService } from '../api/serviceService';
import { createOrder } from '../api/orderService';

/* ─── Zod Schema Validation cho Cart Order Form ──────────────────────────────── */
const cartOrderSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(5, { message: 'Họ và tên phải từ 5 ký tự trở lên' })
    .max(50, { message: 'Họ và tên tối đa 50 ký tự' })
    .refine((val) => val.split(/\s+/).length >= 2, {
      message: 'Vui lòng nhập đầy đủ cả Họ và Tên (tối thiểu 2 từ)',
    })
    .refine(
      (val) =>
        /^[a-zA-ZàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ\s]+$/.test(
          val
        ),
      { message: 'Họ và tên không chứa số hoặc ký tự đặc biệt rác' }
    ),

  phone: z
    .string()
    .trim()
    .regex(/^(03|05|07|08|09)\d{8}$/, {
      message: 'Số điện thoại phải đúng 10 số (bắt đầu bằng 03, 05, 07, 08, 09)',
    }),

  address: z
    .string()
    .trim()
    .min(15, {
      message: 'Địa chỉ phải có tối thiểu 15 ký tự (ghi rõ Số nhà, Đường, Phường/Xã, Quận/Huyện)',
    })
    .max(200, { message: 'Địa chỉ tối đa 200 ký tự' })
    .refine((val) => /\s+/.test(val), {
      message: 'Địa chỉ phải ghi rõ ràng chi tiết tên đường, phường/xã, quận/huyện',
    }),

  bookingDate: z
    .string()
    .min(1, { message: 'Vui lòng chọn ngày hẹn lấy đồ' })
    .refine(
      (dateStr) => {
        if (!dateStr) return false;
        const selected = new Date(dateStr + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selected >= today;
      },
      { message: 'Ngày hẹn không được chọn ngày trong quá khứ' }
    ),

  note: z.string().optional(),
});

type CartOrderFormData = z.infer<typeof cartOrderSchema>;

// ─── Fetch services với timeout dài (60s) cho Render cold start ───────────────
const fetchServicesWithTimeout = async (): Promise<LaundryService[]> => {
  const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000); // 60 giây

  try {
    const res = await fetch(`${BASE}/services`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return (json?.data?.services ?? []) as LaundryService[];
  } finally {
    clearTimeout(timer);
  }
};

// ─── Normalize tiếng Việt ─────────────────────────────────────────────────────
const norm = (s: string) =>
  s.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .trim();

// ─── Map product FE → service DB (khớp 1:1 với 3 service trong seed.js) ─────
//
//  DB service names (sau khi norm):
//   1. "giat say say tieu chuan"  → per_kg,   25.000đ
//   2. "giat hap ao vest"         → per_item, 80.000đ
//   3. "giat giay sneaker"        → per_item, 50.000đ
//
const PRODUCT_SERVICE_MAP: Record<string, string[]> = {
  // Giặt Sấy Tiêu Chuẩn → service "Giặt sấy sấy tiêu chuẩn"
  'giat-say-tieu-chuan': ['tieu chuan', 'giat say'],
  // Giặt Hấp Áo Vest → service "Giặt hấp áo vest"
  'giat-hap-ao-vest':    ['hap', 'vest', 'ao vest'],
  // Spa & Giặt Giày Sneaker → service "Giặt giày sneaker"
  'giat-giay-sneaker':   ['giay', 'sneaker'],
};

const findService = (
  productId: string,
  _productName: string,
  services: LaundryService[]
): LaundryService | null => {
  if (!services || services.length === 0) return null;

  const keywords = PRODUCT_SERVICE_MAP[productId];
  if (!keywords) {
    // Fallback: trả về service đầu tiên và log cảnh báo
    console.warn(`[findService] Không tìm thấy mapping cho productId: ${productId}`);
    return services[0];
  }

  // Tìm service khớp với bất kỳ keyword nào (AND: tất cả keywords phải có ít nhất 1 match)
  for (const svc of services) {
    const ns = norm(svc.name);
    if (keywords.some((kw) => ns.includes(kw))) {
      return svc;
    }
  }

  // Không tìm thấy → log lỗi rõ ràng
  console.error(`[findService] Không match service nào cho "${productId}". Services:`, services.map(s => s.name));
  return null;
};

// ─── Component ────────────────────────────────────────────────────────────────
export const Cart: React.FC = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();

  const isKgService = (unit?: string, id?: string) => {
    if (!unit && !id) return false;
    return unit?.toLowerCase() === 'kg' || id === 'giat-say-tieu-chuan';
  };

  const fixedItemsSubtotal = cartItems.reduce((sum, item) => {
    if (isKgService(item.product.unit, item.product.id)) return sum;
    return sum + item.product.price * item.quantity;
  }, 0);

  const hasKgItems = cartItems.some((item) => isKgService(item.product.unit, item.product.id));
  const hasFixedItems = cartItems.some((item) => !isKgService(item.product.unit, item.product.id));

  const calcShippingFee = fixedItemsSubtotal >= 200000 || cartItems.length === 0 ? 0 : 30000;
  const totalPayableNow = fixedItemsSubtotal + (hasFixedItems ? calcShippingFee : 0);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Services state ────────────────────────────────────────────────────────
  const [services, setServices]           = useState<LaundryService[]>([]);
  const [svcStatus, setSvcStatus]         = useState<'loading' | 'ready' | 'error'>('loading');
  const [retryCount, setRetryCount]       = useState(0);
  const MAX_RETRIES = 8; // ~56 giây tổng

  // ── React Hook Form với Zod ───────────────────────────────────────────────
  const todayStr = new Date().toISOString().split('T')[0];
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CartOrderFormData>({
    resolver: zodResolver(cartOrderSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      bookingDate: todayStr,
      note: '',
    },
  });

  // ── Order state ───────────────────────────────────────────────────────────
  const [isOrdered, setIsOrdered]         = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const [orderError, setOrderError]       = useState<string | null>(null);
  const [orderedItems, setOrderedItems]   = useState<typeof cartItems>([]);
  const [orderTotal, setOrderTotal]       = useState(0);
  const [createdOrderCodes, setCreatedOrderCodes] = useState<string[]>([]);

  // ── Fetch services ────────────────────────────────────────────────────────
  const loadServices = useCallback(async (attempt: number) => {
    setSvcStatus('loading');
    try {
      const data = await fetchServicesWithTimeout();
      if (data.length > 0) {
        setServices(data);
        setSvcStatus('ready');
      } else {
        throw new Error('Danh sách dịch vụ trống');
      }
    } catch {
      if (attempt < MAX_RETRIES) {
        setRetryCount(attempt + 1);
        retryRef.current = setTimeout(() => loadServices(attempt + 1), 7_000);
      } else {
        setSvcStatus('error');
      }
    }
  }, []);

  useEffect(() => {
    loadServices(0);
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [loadServices]);

  const handleManualRetry = () => {
    setRetryCount(0);
    loadServices(0);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // ── Checkout submit handler (Zod Validated) ───────────────────────────────
  const handleCheckoutSubmit = async (data: CartOrderFormData) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (svcStatus !== 'ready' || services.length === 0) {
      setOrderError('Server đang khởi động, vui lòng chờ vài giây rồi thử lại...');
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    try {
      const orderCodes: string[] = [];
      const createdOrderIds: string[] = [];
      const failedMsgs: string[] = [];

      for (const item of cartItems) {
        const svc = findService(item.product.id, item.product.name, services);
        if (!svc) {
          failedMsgs.push(`Không tìm thấy dịch vụ tương ứng cho "${item.product.name}"`);
          continue;
        }
        try {
          const userNote = data.note ? data.note.trim() : '';
          const order = await createOrder({
            serviceId:           svc._id,
            quantity:            item.quantity,
            pickupAddress:       data.address,
            deliveryAddress:     data.address,
            scheduledPickupTime: data.bookingDate ? new Date(data.bookingDate).toISOString() : undefined,
            paymentMethod:       'bank_transfer',
            note: [
              `Dịch vụ: ${item.product.name}`,
              `Khách hàng: ${data.fullName}`,
              `SĐT: ${data.phone}`,
              userNote ? `Ghi chú KH: ${userNote}` : '',
            ].filter(Boolean).join(' | '),
          });
          if (order.orderCode) orderCodes.push(order.orderCode);
          if (order._id) createdOrderIds.push(order._id);
        } catch (err: any) {
          failedMsgs.push(
            err?.response?.data?.message ?? `Lỗi tạo đơn "${item.product.name}"`
          );
        }
      }

      if (orderCodes.length === 0) {
        setOrderError(failedMsgs.join(' — ') || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
        return;
      }

      const finalTotalAmount = totalPayableNow;
      setOrderedItems([...cartItems]);
      setOrderTotal(finalTotalAmount);
      setCreatedOrderCodes(orderCodes);
      setIsPaymentConfirmed(true);

      clearCart();

      // Sau khi đặt lịch thành công, chuyển thẳng khách sang trang Theo Dõi Đơn Hàng
      if (createdOrderIds.length > 0) {
        navigate(`/tracking/${createdOrderIds[0]}`);
      }
      setIsOrdered(true);
    } catch (err: any) {
      setOrderError(err?.response?.data?.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // ── Order success screen ──────────────────────────────────────────────────
  if (isOrdered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ paddingTop: '6rem' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 shadow-xl mx-4"
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
            isPaymentConfirmed
              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
              : 'bg-amber-50 text-amber-600 border border-amber-200'
          }`}>
            {isPaymentConfirmed ? (
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            ) : (
              <Clock className="w-8 h-8 stroke-[2.5] animate-pulse" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isPaymentConfirmed
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {isPaymentConfirmed ? 'Đã Thanh Toán Thành Công' : 'Đang Chờ Thanh Toán VietQR'}
              </span>
            </div>
            <h2 className="font-display font-black text-2xl text-slate-900">
              {isPaymentConfirmed ? 'Thanh Toán & Đặt Hàng Thành Công!' : 'Đã Tạo Đơn Hàng — Đang Chờ Thanh Toán'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isPaymentConfirmed
                ? 'Cảm ơn bạn đã tin tưởng Skill-Up. Nhân viên sẽ liên hệ xác nhận và lấy đồ sớm nhất.'
                : 'Vui lòng mở mã QR VietQR để chuyển khoản. Sau khi SePAY xác nhận giao dịch, hệ thống sẽ tự động cập nhật đơn hàng thành công.'}
            </p>
          </div>

          {/* List mã đơn hàng */}
          {createdOrderCodes.length > 0 && (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-left space-y-2">
              <p className="text-xs font-bold text-[#1E4DB7] uppercase tracking-wider">Mã đơn hàng của bạn:</p>
              <div className="flex flex-wrap gap-2">
                {createdOrderCodes.map((code) => (
                  <span key={code} className="px-3 py-1 bg-white border border-blue-100 rounded-lg text-xs font-mono font-bold text-[#1E4DB7] shadow-xs">
                    #{code}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Đơn hàng đã đặt */}
          <div className="border-t border-b border-slate-100 py-4 text-left space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sản phẩm đã đặt ({orderedItems.length})</p>
            {orderedItems.map((item) => (
              <div key={item.product.id} className="flex justify-between items-center text-sm">
                <span className="text-slate-700 font-medium">
                  {item.product.name} <span className="text-slate-400 text-xs">x{item.quantity}</span>
                </span>
                <span className="font-bold text-slate-900">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
            <div className="pt-2 flex justify-between items-center font-bold text-slate-900 text-base">
              <span>Tổng thanh toán</span>
              <span className="text-[#1E4DB7] font-display font-black">{formatPrice(orderTotal)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => navigate('/products')}
              className="border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              Tiếp Tục Mua Sắm
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => navigate('/orders')}
              className="bg-[#1E4DB7] hover:bg-[#1A42A0] text-white"
            >
              Theo Dõi Đơn Hàng
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ── Cart Empty ────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ paddingTop: '6rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md mx-4 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl"
        >
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-[#1E4DB7]">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-slate-900">Giỏ Hàng Trống</h2>
            <p className="text-slate-500 text-sm">Bạn chưa thêm dịch vụ nào vào giỏ hàng. Hãy khám phá các dịch vụ giặt ủi cao cấp của Skill Up!</p>
          </div>
          <Link to="/products" className="inline-flex">
            <Button variant="primary" className="px-8 py-3.5 gap-2 text-white bg-gradient-to-r from-[#1A42A0] to-[#1E4DB7] hover:from-[#1E4DB7] hover:to-[#2E62D4] shadow-md shadow-blue-500/20">
              Khám Phá Dịch Vụ <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ── Main Cart View ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 pb-20" style={{ paddingTop: '6rem' }}>
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Banner trạng thái server */}
        <AnimatePresence>
          {svcStatus === 'loading' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-2xl flex items-center justify-between text-cyan-800 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-600 shrink-0" />
                <div>
                  <span className="font-bold">Đang kết nối hệ thống dịch vụ...</span>
                  {retryCount > 0 && (
                    <span className="text-cyan-600 ml-1">
                      (Thử lại lần {retryCount}/{MAX_RETRIES} — Vui lòng chờ vài giây nếu server đang khởi động)
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {svcStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-800 text-xs sm:text-sm"
            >
              <div className="flex items-center gap-3">
                <ServerCrash className="w-5 h-5 text-amber-600 shrink-0" />
                <span>Không thể tải danh sách dịch vụ từ server. Đơn hàng của bạn vẫn được lưu trong giỏ.</span>
              </div>
              <button
                onClick={handleManualRetry}
                className="px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold text-xs hover:bg-amber-500 flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Thử lại
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title */}
        <div className="mb-8">
          <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900">Giỏ Hàng Của Bạn</h1>
          <p className="text-slate-500 text-sm mt-1">Kiểm tra thông tin dịch vụ và nhập địa chỉ giao nhận để hoàn tất đặt lịch.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Items List (7 cols) ────────────────────────── */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h2 className="font-display font-bold text-lg text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                <span>Danh Sách Dịch Vụ ({cartItems.length})</span>
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
                </button>
              </h2>

              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => {
                  const isKg = isKgService(item.product.unit, item.product.id);
                  return (
                    <div key={item.product.id} className="py-4 flex gap-4 items-center">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-xl border border-slate-100 shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-sm truncate">{item.product.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{item.product.categoryLabel || item.product.category}</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1">
                          Đơn giá: <span className="font-bold text-[#004B87]">{formatPrice(item.product.price)} / {item.product.unit}</span>
                        </p>
                      </div>

                      {/* Controls / Indicators */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-1.5 min-w-[120px]">
                        {isKg ? (
                          <span className="inline-block px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-lg shadow-2xs">
                            ⚖️ Cân kg báo giá sau
                          </span>
                        ) : (
                          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                              title="Giảm số lượng"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                              title="Tăng số lượng"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {!isKg && (
                          <span className="text-xs font-black text-[#004B87]">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[11px] font-semibold text-rose-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right Column: Order Summary & Checkout Form (5 cols) ─────── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Order summary card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-800 pb-3 border-b border-slate-100">
                Tóm Tắt Đơn Hàng
              </h3>

              <div className="space-y-3 text-sm">
                {hasFixedItems && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Tạm tính dịch vụ ({cartItems.filter(i => !isKgService(i.product.unit, i.product.id)).length} dịch vụ)</span>
                    <span className="font-bold text-slate-800">{formatPrice(fixedItemsSubtotal)}</span>
                  </div>
                )}

                {hasKgItems && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Tạm tính dịch vụ giặt cân kg</span>
                    <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 text-xs">
                      ⚖️ Báo giá sau khi cân kg
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-600">
                  <span>Phí giao nhận tận nơi</span>
                  {calcShippingFee === 0
                    ? <span className="text-emerald-600 font-bold">Miễn phí</span>
                    : <span className="font-semibold text-slate-800">{formatPrice(calcShippingFee)}</span>}
                </div>
                {calcShippingFee > 0 && (
                  <p className="text-[10px] text-slate-400 italic">
                    * Miễn phí giao nhận cho đơn từ {formatPrice(200_000)}
                  </p>
                )}

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Thanh toán lúc đặt</span>
                    <span className="font-display font-black text-xl text-[#004B87]">
                      {totalPayableNow > 0 ? formatPrice(totalPayableNow) : '0 VNĐ (Chưa thu tiền)'}
                    </span>
                  </div>
                  <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-[11px] text-slate-600 leading-relaxed italic">
                    {hasKgItems ? (
                      <>
                        💡 <strong>Lưu ý:</strong> Dịch vụ giặt quần áo cân kg sẽ được nhân viên tới nhận ➔ Về tiệm cân kg thực tế ➔ Báo giá chính xác & gửi mã VietQR thanh toán cho bạn sau.
                      </>
                    ) : (
                      <>
                        💳 <strong>Thanh toán trực tuyến:</strong> Chuyển khoản ngân hàng qua mã VietQR tự động sau khi bấm đặt lịch.
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Checkout Form với Zod Validation Chống Spam ───────────── */}
            <form onSubmit={handleSubmit(handleCheckoutSubmit)} className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-cyan-500 to-amber-500" />
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-800">Thông Tin Giao Nhận</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Nhân viên Skill-Up sẽ tới địa chỉ của bạn để nhận đồ giặt.</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#004B87] space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <span>💡 Quy trình giao nhận & thanh toán:</span>
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    1. Đặt lịch lấy đồ ➔ 2. Nhân viên tới tận nhà nhận đồ ➔ 3. Về tiệm cân số kg & chụp ảnh xác thực ➔ 4. Nhận thông báo số kg chính xác & mã VietQR thanh toán.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Name */}
                  <div className="space-y-1">
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <input
                        {...register('fullName')}
                        type="text"
                        placeholder="Họ và tên của bạn *"
                        style={{ paddingLeft: '2.75rem' }}
                        className={`fw-input has-icon ${errors.fullName ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''}`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="flex items-center gap-1 text-xs text-rose-500 font-medium pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.fullName.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <input
                        {...register('phone')}
                        type="tel"
                        maxLength={10}
                        placeholder="Số điện thoại liên hệ (10 số) *"
                        style={{ paddingLeft: '2.75rem' }}
                        className={`fw-input has-icon ${errors.phone ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''}`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="flex items-center gap-1 text-xs text-rose-500 font-medium pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.phone.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-1">
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <input
                        {...register('address')}
                        type="text"
                        placeholder="Địa chỉ chi tiết (Số nhà, Đường, Phường, Quận) *"
                        style={{ paddingLeft: '2.75rem' }}
                        className={`fw-input has-icon ${errors.address ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''}`}
                      />
                    </div>
                    {errors.address && (
                      <p className="flex items-center gap-1 text-xs text-rose-500 font-medium pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.address.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <input
                        {...register('bookingDate')}
                        type="date"
                        min={todayStr}
                        style={{ paddingLeft: '2.75rem' }}
                        className={`fw-input has-icon min-w-0 cursor-pointer ${errors.bookingDate ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20' : ''}`}
                      />
                    </div>
                    {errors.bookingDate && (
                      <p className="flex items-center gap-1 text-xs text-rose-500 font-medium pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.bookingDate.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Note / Special Instructions */}
                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-1">
                      Ghi chú đặt lịch (không bắt buộc)
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <textarea
                        {...register('note')}
                        rows={2}
                        placeholder="Ví dụ: Giặt riêng áo trắng, có chuông cửa, hẹn lấy đồ sau 5h chiều..."
                        style={{ paddingLeft: '2.75rem' }}
                        className="fw-input has-icon text-xs py-2.5 resize-none w-full border border-slate-200 rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Not logged in */}
                {!isAuthenticated && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Bạn cần <Link to="/login" className="font-bold underline">đăng nhập</Link> để đặt hàng.</span>
                  </div>
                )}

                {/* Error */}
                {orderError && (
                  <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span className="font-medium">{orderError}</span>
                  </div>
                )}

                {/* Submit button (anti-spam) */}
                <Button
                  type="submit"
                  variant="secondary"
                  fullWidth
                  disabled={isSubmitting || isFormSubmitting || svcStatus === 'loading'}
                  className="py-3.5 mt-1 gap-2 text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-md shadow-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting || isFormSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Đang gửi đơn hàng...</>
                  ) : svcStatus === 'loading' ? (
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
