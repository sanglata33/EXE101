import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  UserCheck,
  ChevronRight,
  Package,
  History
} from 'lucide-react';
import { getOrderById, getMyOrders, type Order, ORDER_STATUS_LABELS } from '../api/orderService';
import { useAuth } from '../context/AuthContext';

const STEPS = [
  { key: 'received', label: '📦 Đã nhận đơn', desc: 'Hệ thống đã ghi nhận yêu cầu và đang phân công nhân viên lấy đồ.' },
  { key: 'washing', label: '🫧 Đang giặt', desc: 'Đồ giặt đang được phân loại và giặt sạch bằng công nghệ Skill-Up.' },
  { key: 'drying', label: '🌬️ Đang sấy/ủi', desc: 'Quần áo đang được sấy khô thơm và là phẳng tươm tất.' },
  { key: 'delivering', label: '🚚 Đang giao', desc: 'Shipper đang trên đường vận chuyển giao trả đồ sạch tận nhà.' },
  { key: 'completed', label: '✅ Hoàn thành', desc: 'Đơn hàng đã được giao nhận thành công. Hẹn gặp lại bạn!' }
];

export const OrderTracking: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [searchInput, setSearchInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Danh sách đơn hàng của User khi đã đăng nhập
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [myOrdersLoading, setMyOrdersLoading] = useState(false);

  // Fetch danh sách đơn hàng của tôi
  useEffect(() => {
    if (isAuthenticated) {
      setMyOrdersLoading(true);
      getMyOrders({ limit: 10 })
        .then(res => {
          setMyOrders(res.orders);
        })
        .catch(err => {
          console.error('Không thể tải lịch sử đơn hàng:', err);
        })
        .finally(() => {
          setMyOrdersLoading(false);
        });
    } else {
      setMyOrders([]);
    }
  }, [isAuthenticated, id]); // Reload danh sách khi có thay đổi đơn hàng

  // Tự động fetch chi tiết đơn hàng nếu có ID trên URL
  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    } else {
      setOrder(null);
      setImages([]);
    }
  }, [id]);

  // Lắng nghe cập nhật real-time trạng thái đơn hàng qua WebSocket
  useEffect(() => {
    if (!order) return;

    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const wsUrl = backendUrl.replace(/^http/, 'ws') + `/orders/track?code=${order.orderCode}`;
    
    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'order_status_updated' && (data.orderCode === order.orderCode || data.orderId === order._id)) {
            setOrder(prev => {
              if (!prev) return null;
              
              const newHistory = data.statusHistory || [
                ...prev.statusHistory,
                { status: data.status, note: data.note, timestamp: new Date().toISOString() }
              ];
              
              return {
                ...prev,
                status: data.status,
                statusHistory: newHistory
              };
            });

            // Tự động cập nhật lại danh sách đơn hàng ở bên trái
            if (isAuthenticated) {
              getMyOrders({ limit: 10 }).then(res => setMyOrders(res.orders)).catch(console.error);
            }
          }
        } catch (err) {
          console.error('Lỗi phân tích WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('Lỗi kết nối WebSocket tracking:', err);
      };
    } catch (err) {
      console.warn('Không khởi tạo được WebSocket:', err);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [order, isAuthenticated]);

  const fetchOrderDetails = async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderById(orderId);
      setOrder(data.order);
      setImages(data.images || []);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Không tìm thấy thông tin đơn hàng này. Vui lòng kiểm tra lại mã ID.'
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/tracking/${searchInput.trim()}`);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return -1;
    if (order.status === 'cancelled') return -1;
    return STEPS.findIndex(step => step.key === order.status);
  };

  const currentStepIdx = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#2A2520] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 pt-10">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#756458] hover:text-[#C5A880] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C5A880]/15 text-[#8E7A58] border border-[#EBE3D5] rounded-full text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Order Center
          </span>
        </div>

        {/* Layout Grid: 2 Columns if Logged In */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CỘT TRÁI: DÀNH CHO USER ĐÃ LOGGED IN (Chiếm 4/12 cols) HOẶC FORM TRA CỨU */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Form Tra Cứu (Luôn hiển thị trên cùng để tìm nhanh) */}
            <div className="bg-white border border-[#EBE3D5]/60 rounded-3xl p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#C5A880]/5 rounded-full filter blur-xl pointer-events-none" />
              <h2 className="text-lg font-bold text-[#2A2520] mb-1">Tra cứu bằng Order ID</h2>
              <p className="text-xs text-[#756458] mb-4">Nhập mã định danh đơn hàng để xem tiến trình thời gian thực.</p>
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Mã đơn hàng (ví dụ: 64f1a2b3...)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-[#EBE3D5] rounded-xl text-xs focus:outline-none focus:border-[#C5A880] text-[#2A2520]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !searchInput.trim()}
                  className="px-4 py-2.5 bg-[#C5A880] hover:bg-[#BCA374] text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-40"
                >
                  Tìm kiếm
                </button>
              </form>
            </div>

            {/* Danh Sách Đơn Hàng Của Tôi */}
            {isAuthenticated ? (
              <div className="bg-white border border-[#EBE3D5]/60 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-[#2A2520] flex items-center gap-2">
                    <History className="w-4 h-4 text-[#C5A880]" />
                    Lịch sử đơn hàng của bạn
                  </h3>
                  <span className="text-[10px] bg-[#FAF6F0] border border-[#EBE3D5] text-[#8F7E71] px-2 py-0.5 rounded-full font-bold">
                    {myOrders.length} đơn
                  </span>
                </div>

                {myOrdersLoading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="w-6 h-6 text-[#C5A880] animate-spin mx-auto" />
                    <p className="text-[11px] text-[#756458] mt-2">Đang tải đơn hàng...</p>
                  </div>
                ) : myOrders.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 space-y-2">
                    <ShoppingBag className="w-8 h-8 text-slate-350 mx-auto" />
                    <p className="text-xs">Bạn chưa có đơn đặt lịch nào.</p>
                    <Link to="/" className="text-xs text-[#C5A880] hover:underline inline-block font-semibold">Đặt lịch ngay hôm nay</Link>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1 no-scrollbar">
                    {myOrders.map((myOrder) => {
                      const isSelected = order?._id === myOrder._id;
                      const serviceName = typeof myOrder.service === 'object' ? myOrder.service.name : 'Gói giặt ủi';
                      
                      return (
                        <button
                          key={myOrder._id}
                          onClick={() => navigate(`/tracking/${myOrder._id}`)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                            isSelected 
                              ? 'bg-[#C5A880]/15 border-[#C5A880] text-[#C5A880] shadow-md shadow-gold-500/5' 
                              : 'bg-white border-[#EBE3D5]/60 text-[#756458] hover:border-[#C5A880]/50'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0 flex-grow">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-xs font-bold ${isSelected ? 'text-[#C5A880]' : 'text-[#2A2520]'}`}>
                                #{myOrder.orderCode}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold ${
                                myOrder.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' :
                                myOrder.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-250' :
                                'bg-[#C5A880]/15 text-[#8E7A58] border border-[#EBE3D5]'
                              }`}>
                                {ORDER_STATUS_LABELS[myOrder.status] || myOrder.status}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-[#2A2520] truncate">{serviceName}</p>
                            <p className="text-[10px] text-[#8F7E71]">
                              {new Date(myOrder.createdAt).toLocaleDateString('vi-VN')} · {myOrder.totalPrice.toLocaleString('vi-VN')}đ
                            </p>
                          </div>
                          <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isSelected ? 'text-[#C5A880] translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'}`} />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              /* Alert gợi ý đăng nhập để tiện theo dõi */
              <div className="bg-white border border-[#EBE3D5]/60 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="w-12 h-12 bg-[#C5A880]/15 border border-[#C5A880]/20 text-[#C5A880] rounded-2xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#2A2520]">Đăng nhập tài khoản</h3>
                  <p className="text-xs text-[#756458] mt-1 leading-relaxed">
                    Đăng nhập để xem danh sách đơn hàng đã đặt mà không cần copy-paste tìm kiếm mã đơn thủ công.
                  </p>
                </div>
                <Link
                  to="/login"
                  className="block w-full py-2.5 bg-[#C5A880]/10 hover:bg-[#C5A880]/20 text-[#2A2520] rounded-xl text-xs font-bold text-center transition-all border border-[#C5A880]/30"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: HIỂN THỊ TIẾN TRÌNH THEO DÕI ĐƠN HÀNG (Chiếm 7/12 cols) */}
          <div className="lg:col-span-7">
            
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 text-center bg-white border border-[#EBE3D5]/60 rounded-3xl p-8"
                >
                  <Loader2 className="w-8 h-8 text-[#C5A880] animate-spin mx-auto mb-2" />
                  <p className="text-xs text-[#756458] font-bold uppercase tracking-wider">Đang kết xuất thông tin đơn...</p>
                </motion.div>
              )}

              {!loading && error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-6 bg-white border border-[#EBE3D5]/60 rounded-3xl text-center space-y-3"
                >
                  <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
                  <h3 className="font-bold text-[#2A2520] text-base">Có lỗi xảy ra</h3>
                  <p className="text-xs text-[#756458] max-w-sm mx-auto leading-relaxed">{error}</p>
                </motion.div>
              )}

              {!loading && !order && !error && (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-[#EBE3D5]/60 rounded-3xl p-10 text-center space-y-4 py-20 shadow-xs"
                >
                  <div className="w-16 h-16 bg-[#C5A880]/10 border border-[#C5A880]/20 text-[#C5A880] rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Package className="w-8 h-8 text-[#C5A880]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2A2520] text-base">Theo Dõi Tiến Trình Thực Hiện</h3>
                    <p className="text-xs text-[#756458] max-w-sm mx-auto mt-1 leading-relaxed">
                      {isAuthenticated 
                        ? 'Vui lòng chọn một đơn hàng bên danh sách hoặc truy cập vào trang Hồ sơ để bắt đầu quan sát tiến trình.' 
                        : 'Vui lòng nhập mã ID đơn hàng hoặc Đăng nhập để bắt đầu theo dõi.'}
                    </p>
                  </div>
                </motion.div>
              )}

              {!loading && order && !error && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Card thông tin đơn */}
                  <div className="bg-white border border-[#EBE3D5]/60 rounded-3xl p-6 space-y-4 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Mã đơn hàng</span>
                        <h3 className="text-lg font-mono font-bold text-[#C5A880]">{order.orderCode}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          order.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' :
                          order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-250' :
                          'bg-[#C5A880]/15 text-[#8E7A58] border border-[#EBE3D5]'
                        }`}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[#8F7E71] block mb-1">Gói dịch vụ</span>
                        <strong className="text-[#2A2520] text-sm">
                          {typeof order.service === 'object' ? order.service.name : 'Dịch vụ giặt ủi'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[#8F7E71] block mb-1">Tổng tiền thanh toán</span>
                        <strong className="text-[#C5A880] text-sm">
                          {order.totalPrice.toLocaleString('vi-VN')} VNĐ
                        </strong>
                      </div>
                      <div className="sm:col-span-2 border-t border-slate-100 pt-3 flex gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-[#8F7E71] block mb-0.5">Địa chỉ giao nhận đồ</span>
                          <p className="text-[#5A4B40] leading-relaxed">{order.pickupAddress}</p>
                        </div>
                      </div>
                      {order.scheduledPickupTime && (
                        <div className="sm:col-span-2 border-t border-slate-100 pt-3 flex gap-2">
                          <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="text-[#8F7E71] block mb-0.5">Hẹn thời gian lấy đồ</span>
                            <p className="text-[#5A4B40]">
                              {new Date(order.scheduledPickupTime).toLocaleString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                      {order.note && (
                        <div className="sm:col-span-2 border-t border-slate-100 pt-3">
                          <span className="text-[#8F7E71] block mb-1">Ghi chú của khách hàng</span>
                          <p className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EBE3D5] text-[#5A4B40] italic">
                            "{order.note}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Timeline */}
                  <div className="bg-white border border-[#EBE3D5]/60 rounded-3xl p-6 shadow-xs">
                    <h3 className="text-base font-bold text-[#2A2520] mb-6 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#C5A880]" /> Tiến trình thực hiện đơn hàng
                    </h3>

                    {order.status === 'cancelled' ? (
                      <div className="p-6 bg-rose-50 border border-rose-250 text-rose-700 rounded-2xl space-y-2">
                        <h4 className="font-bold text-base">Đơn Hàng Đã Bị Hủy!</h4>
                        <p className="text-xs text-[#756458] leading-relaxed">
                          Đơn hàng đã được đánh dấu hủy trên hệ thống. Xin lỗi vì sự bất tiện này.
                        </p>
                        {order.statusHistory.length > 0 && order.statusHistory[order.statusHistory.length - 1]?.note && (
                          <div className="text-xs font-semibold text-rose-700 pt-2 border-t border-rose-100">
                            Lý do hủy: "{order.statusHistory[order.statusHistory.length - 1].note}"
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative pl-8 border-l-2 border-slate-100 ml-4 py-2 space-y-8">
                        {STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentStepIdx;
                          const isCurrent = idx === currentStepIdx;
                          
                          const historyItem = order.statusHistory?.find(h => h.status === step.key);

                          return (
                            <div key={step.key} className="relative text-left">
                              
                              {/* Dot indicator */}
                              <div className={`absolute -left-[42px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300 ${
                                isCurrent
                                  ? 'bg-[#C5A880] text-white border-[#C5A880] shadow-md shadow-gold-500/10 scale-110'
                                  : isCompleted
                                  ? 'bg-[#FCFBF9] text-[#C5A880] border-[#C5A880]/65'
                                  : 'bg-[#FCFBF9] text-slate-400 border-slate-200'
                              }`}>
                                {idx + 1}
                              </div>

                              {/* Step description */}
                              <div className="space-y-1">
                                <h4 className={`text-sm font-bold ${
                                  isCurrent ? 'text-[#C5A880]' : isCompleted ? 'text-[#2A2520]' : 'text-slate-400'
                                }`}>
                                  {step.label}
                                </h4>
                                <p className="text-xs text-[#756458] leading-relaxed">
                                  {step.key === 'received' && (order.paymentMethod === 'bank_transfer' || order.paymentMethod === 'vietqr') && order.paymentStatus !== 'paid'
                                    ? 'Đơn hàng đã được tạo. Vui lòng thanh toán VietQR để hệ thống tự động ghi nhận và phân công nhân viên lấy đồ.'
                                    : step.desc}
                                </p>
                                
                                {historyItem && historyItem.note && (
                                  <div className="mt-2 text-[11px] text-[#5A4B40] bg-[#FAF6F0] border border-[#EBE3D5] rounded-lg p-2.5 italic">
                                    "{historyItem.note}"
                                  </div>
                                )}

                                {historyItem && (
                                  <span className="text-[10px] text-slate-400 block mt-1">
                                    Cập nhật: {new Date(historyItem.timestamp).toLocaleString('vi-VN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Uploaded Images */}
                  {images.length > 0 && (
                    <div className="bg-white border border-[#EBE3D5]/60 rounded-3xl p-6 shadow-xs">
                      <h3 className="text-base font-bold text-[#2A2520] mb-4">Ảnh xác thực giao nhận</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {images.map((img) => (
                          <div key={img._id} className="relative rounded-2xl overflow-hidden border border-slate-100 bg-[#FCFBF9]">
                            <img 
                              src={img.imageUrl} 
                              alt="Verification" 
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-[#FAF6F0]/90 backdrop-blur-xs p-2 text-center text-[10px] font-bold text-[#2A2520]">
                              {img.imageType === 'pickup' ? '📸 Ảnh nhận đồ' : '📸 Ảnh trả đồ sạch'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </div>
  );
};
