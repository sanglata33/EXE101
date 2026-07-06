/**
 * CreateOrder.tsx — Component ví dụ: Tạo đơn hàng mới
 *
 * Minh họa cách:
 *  1. Import hàm từ orderService (không quan tâm URL/header)
 *  2. Xử lý loading / error / success state
 *  3. Dùng useAuth để kiểm tra đăng nhập trước khi thao tác
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin, Calendar, CheckCircle, AlertCircle, Loader2, PackagePlus } from 'lucide-react';
import { createOrder, type CreateOrderPayload, type Order } from '../../api/orderService';
import { useAuth } from '../../context/AuthContext';

// ─── Component ────────────────────────────────────────────────────────────────

export const CreateOrder: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  // Form state
  const [pickupAddress,   setPickupAddress]   = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [pickupDate,      setPickupDate]      = useState('');
  const [paymentMethod,   setPaymentMethod]   = useState<'cash' | 'vnpay' | 'momo'>('cash');
  const [note,            setNote]            = useState('');

  // Async state
  const [isLoading,     setIsLoading]     = useState(false);
  const [successOrder,  setSuccessOrder]  = useState<Order | null>(null);
  const [errorMessage,  setErrorMessage]  = useState<string | null>(null);

  // ─── Submit Handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMessage('Vui lòng đăng nhập để đặt hàng.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessOrder(null);

    // Payload gửi lên Backend — FE không cần biết URL hay header
    const payload: CreateOrderPayload = {
      serviceId: 'service_standard_01',
      quantity: 3,
      pickupAddress,
      deliveryAddress,
      scheduledPickupTime: new Date(pickupDate).toISOString(),
      note: note || undefined,
    };

    try {
      // ✅ Chỉ cần gọi hàm từ service — 1 dòng!
      const newOrder = await createOrder(payload);
      setSuccessOrder(newOrder);
      // Reset form
      setPickupAddress('');
      setDeliveryAddress('');
      setPickupDate('');
      setNote('');
    } catch (err: unknown) {
      // Xử lý lỗi từ server (interceptor đã log, ta chỉ hiển thị message)
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMessage(
        axiosErr.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <PackagePlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100">Tạo Đơn Hàng Mới</h1>
            {user && (
              <p className="text-xs text-slate-400">Xin chào, <span className="text-cyan-400">{user.name}</span></p>
            )}
          </div>
        </div>

        {/* Success State */}
        <AnimatePresence>
          {successOrder && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-400">Đặt hàng thành công!</p>
                <p className="text-xs text-slate-400 mt-1">
                  Mã đơn hàng: <span className="font-mono text-emerald-300">{successOrder.orderCode}</span>
                </p>
                <p className="text-xs text-slate-400">
                  Tổng tiền: <span className="text-emerald-300 font-semibold">
                    {successOrder.totalPrice.toLocaleString('vi-VN')}₫
                  </span>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{errorMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl"
        >
          {/* Pickup Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Địa chỉ lấy đồ
            </label>
            <input
              required
              id="pickup-address"
              type="text"
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="Số nhà, đường, phường/xã..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Delivery Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Địa chỉ giao đồ
            </label>
            <input
              required
              id="delivery-address"
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Số nhà, đường, phường/xã..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Pickup Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Ngày lấy đồ
            </label>
            <input
              required
              id="pickup-date"
              type="datetime-local"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> Phương thức thanh toán
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['cash', 'vnpay', 'momo'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  id={`payment-${method}`}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {method === 'cash' ? '💵 Tiền mặt' : method === 'vnpay' ? '🏦 VNPay' : '📱 MoMo'}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Ghi chú (tuỳ chọn)
            </label>
            <textarea
              id="order-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Yêu cầu đặc biệt, hướng dẫn cụ thể..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            id="submit-order"
            disabled={isLoading || !isAuthenticated}
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <PackagePlus className="w-4 h-4" />
                {isAuthenticated ? 'Đặt Hàng Ngay' : 'Đăng nhập để đặt hàng'}
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateOrder;
