import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Trash2, ShoppingBag, ArrowRight, CheckCircle2, ChevronRight,
  MapPin, Phone, User, Calendar, CreditCard, AlertCircle, Loader2,
  RefreshCw, ServerCrash,
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

  paymentMethod: z.enum(['cod', 'transfer']),
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

// ─── Map product → service ────────────────────────────────────────────────────
const PRODUCT_KEYWORDS: Record<string, string[]> = {
  'giat-say-nhanh':    ['tieu chuan', 'giat say', 'standard'],
  'giat-say-premium':  ['premium', 'nuoc hoa', 'cao cap'],
  'giat-hap-suit':     ['vest', 'suit', 'ao vest'],
  'giat-hap-vay-cuoi': ['vay cuoi', 'cuoi'],
  'ui-phang-nhanh':    ['ui phang', 'ui'],
  'giat-giay-sneaker': ['giay', 'sneaker'],
  'giat-thu-bong':     ['thu bong', 'bong'],
  'giat-nem-sofa':     ['nem', 'sofa', 've sinh'],
};

const findService = (
  productId: string,
  productName: string,
  services: LaundryService[]
): LaundryService | null => {
  if (!services || services.length === 0) return null;

  const keywords = PRODUCT_KEYWORDS[productId] ?? [norm(productName).split(' ')[0]];
  for (const svc of services) {
    const ns = norm(svc.name);
    if (keywords.some((kw) => ns.includes(kw) || kw.includes(ns.split(' ')[0]))) return svc;
  }
  return services[0] || null;
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
    watch,
    formState: { errors, isSubmitting: isFormSubmitting },
  } = useForm<CartOrderFormData>({
    resolver: zodResolver(cartOrderSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      bookingDate: todayStr,
      paymentMethod: 'cod',
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  // ── Order state ───────────────────────────────────────────────────────────
  const [isOrdered, setIsOrdered]         = useState(false);
  const [isSubmitting, setIsSubmitting]   = useState(false);
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
      const failedMsgs: string[] = [];

      for (const item of cartItems) {
        const svc = findService(item.product.id, item.product.name, services);
        if (!svc) {
          failedMsgs.push(`Không tìm thấy dịch vụ tương ứng cho "${item.product.name}"`);
          continue;
        }
        try {
          const order = await createOrder({
            serviceId:           svc._id,
            quantity:            item.quantity,
            pickupAddress:       data.address,
            deliveryAddress:     data.address,
            scheduledPickupTime: data.bookingDate ? new Date(data.bookingDate).toISOString() : undefined,
            note: [
              `Dịch vụ KH chọn: ${item.product.name}`,
              `Khách hàng: ${data.fullName}`,
              `SĐT: ${data.phone}`,
              `Thanh toán: ${data.paymentMethod === 'cod' ? 'Khi giao nhận' : 'Chuyển khoản'}`,
            ].join(' | '),
          });
          if (order.orderCode) orderCodes.push(order.orderCode);
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
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-black text-2xl text-slate-900">Đặt Hàng Thành Công!</h2>
            <p className="text-slate-500 text-sm">
              Cảm ơn bạn đã tin tưởng FreshWash. Nhân viên sẽ liên hệ xác nhận đơn hàng sớm nhất.
            </p>
          </div>

          {/* List mã đơn hàng */}
          {createdOrderCodes.length > 0 && (
            <div className="p-4 rounded-2xl bg-cyan-50/60 border border-cyan-100 text-left space-y-2">
              <p className="text-xs font-bold text-cyan-800 uppercase tracking-wider">Mã đơn hàng của bạn:</p>
              <div className="flex flex-wrap gap-2">
                {createdOrderCodes.map((code) => (
                  <span key={code} className="px-3 py-1 bg-white border border-cyan-200 rounded-lg text-xs font-mono font-bold text-cyan-700 shadow-xs">
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
              <span className="text-cyan-600 font-display font-black">{formatPrice(orderTotal)}</span>
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
              onClick={() => navigate('/')}
              className="bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              Về Trang Chủ
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
          <div className="w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center mx-auto text-cyan-500">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl text-slate-900">Giỏ Hàng Trống</h2>
            <p className="text-slate-500 text-sm">Bạn chưa thêm dịch vụ nào vào giỏ hàng. Hãy khám phá các dịch vụ giặt ủi cao cấp của FreshWash!</p>
          </div>
          <Link to="/products" className="inline-flex">
            <Button variant="primary" className="px-8 py-3.5 gap-2 text-white bg-cyan-600 hover:bg-cyan-500">
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
                {cartItems.map((item) => (
                  <div key={item.product.id} className="py-4 flex gap-4 items-center">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-slate-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm truncate">{item.product.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.product.category}</p>
                      <p className="text-sm font-bold text-cyan-600 mt-1">
                        {formatPrice(item.product.price)} / {item.product.unit}
                      </p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Total item price */}
                    <div className="text-right shrink-0 min-w-[80px]">
                      <p className="font-bold text-slate-900 text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-xs text-rose-400 hover:text-rose-600 mt-1 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
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

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-slate-800">{formatPrice(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phí giao nhận</span>
                  {shippingFee === 0
                    ? <span className="text-emerald-600 font-bold">Miễn phí</span>
                    : <span className="font-semibold text-slate-800">{formatPrice(shippingFee)}</span>}
                </div>
                {shippingFee > 0 && (
                  <p className="text-[10px] text-slate-400 italic">
                    * Miễn phí giao nhận cho đơn từ {formatPrice(200_000)}
                  </p>
                )}
                <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Tổng cộng</span>
                  <span className="font-display font-black text-2xl text-cyan-600">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>

            {/* ── Checkout Form với Zod Validation Chống Spam ───────────── */}
            <form onSubmit={handleSubmit(handleCheckoutSubmit)} className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-cyan-500 to-amber-500" />
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-800">Thông Tin Giao Nhận</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Kiểm tra kỹ thông tin người nhận trước khi hoàn tất đặt đơn.</p>
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

                  {/* Payment */}
                  <div className="pt-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">
                      Hình thức thanh toán
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'cod', label: 'Khi giao nhận' },
                        { value: 'transfer', label: 'Chuyển khoản' }
                      ].map((opt) => (
                        <label key={opt.value} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedPaymentMethod === opt.value
                            ? 'border-cyan-500 bg-cyan-50 text-cyan-600 font-bold'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800'
                        }`}>
                          <input
                            {...register('paymentMethod')}
                            type="radio"
                            value={opt.value}
                            className="sr-only"
                          />
                          <CreditCard className="w-4 h-4 shrink-0" />
                          <span className="text-xs">{opt.label}</span>
                        </label>
                      ))}
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
