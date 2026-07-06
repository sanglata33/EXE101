import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, CheckCircle2, ChevronRight, MapPin, Phone, User, Calendar, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';

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

  const [isOrdered, setIsOrdered] = useState(false);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdered(true);
    clearCart();
  };

  // If order was successfully placed, render a premium confirmation screen
  if (isOrdered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-6 bg-grid shadow-xl"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl text-slate-900">Đặt lịch thành công!</h2>
            <p className="text-slate-650 text-sm leading-relaxed">
              Mã vận đơn của bạn là <span className="text-cyan-600 font-bold">#FW-2026</span>. Nhân viên FreshWash sẽ liên hệ trực tiếp với bạn qua số điện thoại để xác nhận thông tin lấy quần áo.
            </p>
          </div>

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

  // If cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pt-24 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 mb-6 shadow-sm">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Giỏ hàng của bạn đang trống</h2>
        <p className="text-slate-650 text-sm mb-8 max-w-xs">Hãy khám phá các gói dịch vụ giặt sấy chất lượng cao của chúng tôi ngay hôm nay.</p>
        <Link to="/products">
          <Button variant="primary" className="gap-2 text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400">
            Khám phá dịch vụ
            <ArrowRight className="w-4.5 h-4.5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <h1 className="font-display font-extrabold text-3xl text-slate-900 mb-10">
          Giỏ Hàng <span className="text-cyan-600">Dịch Vụ</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {cartItems.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white border border-slate-200 gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Details thumbnail */}
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

                {/* Actions & Quantity row */}
                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  
                  {/* Quantity selector */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-all font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-slate-800 text-xs font-bold select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition-all font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Pricing and delete */}
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

          {/* Right Column: Order Details & Checkout Form */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Price Calculations Summary */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-amber-500" />
              <div className="p-5 space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-800">Tóm Tắt Đơn Hàng</h3>
              
              <div className="space-y-2.5 text-sm text-slate-650">
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
                  <p className="text-[10px] text-slate-550 italic">
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

            {/* Booking Details Form */}
            <form onSubmit={handleCheckout} className="rounded-2xl bg-white border border-slate-200 shadow-md overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-amber-500 to-cyan-500" />
              <div className="p-5 space-y-4">
              <h3 className="font-display font-bold text-lg text-slate-800">Thông Tin Giao Nhận</h3>
              
              <div className="space-y-3">
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

                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                  <input
                    required
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="fw-input has-icon min-w-0"
                  />
                </div>

                {/* Payment Method Option */}
                <div className="pt-2">
                  <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-2">Hình thức thanh toán</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="sr-only"
                      />
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs font-bold">Khi giao nhận</span>
                    </label>

                    <label className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:text-slate-800'
                    }`}>
                      <input
                        type="radio"
                        name="payment"
                        value="transfer"
                        checked={paymentMethod === 'transfer'}
                        onChange={() => setPaymentMethod('transfer')}
                        className="sr-only"
                      />
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs font-bold">Chuyển khoản</span>
                    </label>
                  </div>
                </div>

              </div>

              <Button type="submit" variant="secondary" fullWidth className="py-3 mt-2 gap-2 text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-md shadow-amber-500/20">
                Xác Nhận Đặt Lịch
                <ChevronRight className="w-4 h-4" />
              </Button>
              </div>
            </form>

          </div>

        </div>

      </div>
    </div>
  );
};
