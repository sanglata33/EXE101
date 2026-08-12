import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Package,
  Phone,
  MapPin,
  Camera,
  CheckCircle2,
  Navigation,
  FileText,
  Loader,
  RefreshCw,
  Upload,
} from 'lucide-react';
import {
  getMyOrders,
  updateOrderStatus,
  uploadOrderImages,
  type Order,
  type OrderStatus,
} from '../api/orderService';
import { useAuth } from '../context/AuthContext';

export const ShipperDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pickup' | 'delivery' | 'history'>('pickup');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Upload modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [uploadType, setUploadType] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getMyOrders();
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách đơn shipper:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setIsSubmitting(true);

      // 1. Upload ảnh xác thực nếu có chọn file
      if (selectedFile) {
        await uploadOrderImages(selectedOrder._id, [selectedFile], uploadType);
      }

      // 2. Chuyển trạng thái đơn hàng tương ứng
      const newStatus: OrderStatus = uploadType === 'pickup' ? 'picked_up' : 'completed';
      await updateOrderStatus(
        selectedOrder._id,
        newStatus,
        uploadType === 'pickup'
          ? 'Shipper đã tới nhà nhận đồ và tải ảnh xác thực'
          : 'Shipper đã giao trả đồ sạch tới khách và chụp ảnh hoàn thành'
      );

      alert(
        uploadType === 'pickup'
          ? '✅ Đã xác nhận LẤY ĐỒ thành công! Tiệm giặt sẽ cân kg và báo giá cho khách.'
          : '🎉 Đã xác nhận GIAO ĐỒ & HOÀN THÀNH đơn hàng thành công!'
      );

      setSelectedOrder(null);
      setSelectedFile(null);
      setPreviewUrl('');
      fetchOrders();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi cập nhật tiến trình shipper');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lọc danh sách đơn theo tab
  const pickupOrders = orders.filter((o) => o.status === 'received');
  const deliveryOrders = orders.filter((o) => o.status === 'delivering');
  const historyOrders = orders.filter((o) => ['picked_up', 'weighed', 'washing', 'drying', 'completed'].includes(o.status));

  const formatPrice = (price?: number) =>
    price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price) : 'Báo giá sau';

  const formatCustomerName = (cust: any) => {
    if (typeof cust === 'object' && cust?.name) return cust.name;
    return 'Khách hàng';
  };

  const formatCustomerPhone = (cust: any) => {
    if (typeof cust === 'object' && cust?.phone) return cust.phone;
    return '';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 font-sans">
      {/* Top Bar Header */}
      <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-amber-500/20">
              🛵
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Giao Nhận Skill-Up
              </p>
              <h1 className="text-sm font-black text-white truncate max-w-[180px]">
                {user?.name || 'Shipper'}
              </h1>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">
        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 text-center">
            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Cần Lấy</p>
            <p className="text-xl font-black text-white mt-0.5">{pickupOrders.length}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 text-center">
            <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Cần Giao</p>
            <p className="text-xl font-black text-white mt-0.5">{deliveryOrders.length}</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl p-3 text-center">
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Lịch Sử</p>
            <p className="text-xl font-black text-white mt-0.5">{historyOrders.length}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('pickup')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'pickup'
                ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Lấy Đồ ({pickupOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('delivery')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'delivery'
                ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Giao Đồ ({deliveryOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-800 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Lịch Sử</span>
          </button>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Đang tải danh sách đơn...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* TAB 1: PICKUP ORDERS */}
            {activeTab === 'pickup' && (
              <>
                {pickupOrders.length === 0 ? (
                  <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl p-8 text-center space-y-2">
                    <p className="text-3xl">📦</p>
                    <p className="text-sm font-bold text-slate-300">Không có đơn hàng cần đến lấy</p>
                    <p className="text-xs text-slate-500">Các đơn giặt mới sẽ xuất hiện ở đây khi khách hàng đặt lịch.</p>
                  </div>
                ) : (
                  pickupOrders.map((ord) => {
                    const phone = formatCustomerPhone(ord.customer);
                    const custName = formatCustomerName(ord.customer);

                    return (
                      <div
                        key={ord._id}
                        className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden"
                      >
                        <div className="h-1 w-full bg-amber-400 absolute top-0 left-0 right-0" />
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            #{ord.orderCode}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(ord.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Customer & Address */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-base">{custName}</h3>
                            {phone && (
                              <a
                                href={`tel:${phone}`}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-sm"
                              >
                                <Phone className="w-3.5 h-3.5 fill-current" />
                                <span>Gọi ngay</span>
                              </a>
                            )}
                          </div>

                          <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50">
                            <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-200 leading-relaxed font-medium">
                              {ord.pickupAddress}
                            </p>
                          </div>
                        </div>

                        {/* Order Notes */}
                        {ord.note && (
                          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-xs text-amber-200">
                            <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                            <span className="italic leading-normal">Ghi chú: {ord.note}</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ord.pickupAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
                          >
                            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Chỉ Đường</span>
                          </a>

                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setUploadType('pickup');
                              setSelectedFile(null);
                              setPreviewUrl('');
                            }}
                            className="py-2.5 px-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Chụp Ảnh Đã Lấy</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* TAB 2: DELIVERY ORDERS */}
            {activeTab === 'delivery' && (
              <>
                {deliveryOrders.length === 0 ? (
                  <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl p-8 text-center space-y-2">
                    <p className="text-3xl">🚚</p>
                    <p className="text-sm font-bold text-slate-300">Không có đơn hàng cần đi giao</p>
                    <p className="text-xs text-slate-500">Các đơn sấy xong sẽ được xếp vào đây để shipper đi giao trả đồ.</p>
                  </div>
                ) : (
                  deliveryOrders.map((ord) => {
                    const phone = formatCustomerPhone(ord.customer);
                    const custName = formatCustomerName(ord.customer);

                    return (
                      <div
                        key={ord._id}
                        className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-3 relative overflow-hidden"
                      >
                        <div className="h-1 w-full bg-cyan-400 absolute top-0 left-0 right-0" />
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/20">
                            #{ord.orderCode}
                          </span>
                          <span className="text-[11px] font-black text-emerald-400">
                            {formatPrice(ord.totalPrice)}
                          </span>
                        </div>

                        {/* Customer & Address */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-base">{custName}</h3>
                            {phone && (
                              <a
                                href={`tel:${phone}`}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-sm"
                              >
                                <Phone className="w-3.5 h-3.5 fill-current" />
                                <span>Gọi ngay</span>
                              </a>
                            )}
                          </div>

                          <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-700/50">
                            <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-slate-200 leading-relaxed font-medium">
                              {ord.deliveryAddress || ord.pickupAddress}
                            </p>
                          </div>
                        </div>

                        {/* Weight info */}
                        {ord.actualWeight && (
                          <div className="flex items-center justify-between text-xs bg-slate-900/80 p-2 rounded-xl border border-slate-700">
                            <span className="text-slate-400">Số kg cân tại tiệm:</span>
                            <span className="font-bold text-amber-400">{ord.actualWeight} kg</span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              ord.deliveryAddress || ord.pickupAddress
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors text-center"
                          >
                            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Chỉ Đường</span>
                          </a>

                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setUploadType('delivery');
                              setSelectedFile(null);
                              setPreviewUrl('');
                            }}
                            className="py-2.5 px-3 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Ảnh Giao & Hoàn Thành</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </>
            )}

            {/* TAB 3: HISTORY */}
            {activeTab === 'history' && (
              <>
                {historyOrders.length === 0 ? (
                  <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl p-8 text-center space-y-2">
                    <p className="text-3xl">📋</p>
                    <p className="text-sm font-bold text-slate-300">Chưa có lịch sử giao nhận</p>
                  </div>
                ) : (
                  historyOrders.map((ord) => (
                    <div
                      key={ord._id}
                      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3.5 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-300">#{ord.orderCode}</span>
                        <p className="text-xs font-semibold text-slate-200 mt-0.5">{formatCustomerName(ord.customer)}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(ord.updatedAt || ord.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-700 text-slate-300 border border-slate-600">
                        {ord.status === 'completed' ? '✅ Hoàn thành' : '🛵 Đã xử lý'}
                      </span>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* UPLOAD & CONFIRMATION MODAL FOR SHIPPER */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-slate-950"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl space-y-4 z-10 text-slate-100"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">
                    {uploadType === 'pickup' ? 'Xác thực Đã Lấy Đồ' : 'Xác thực Đã Giao Đồ'}
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded">
                  #{selectedOrder.orderCode}
                </span>
              </div>

              <form onSubmit={handleConfirmAction} className="space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {uploadType === 'pickup'
                    ? 'Chụp hoặc tải ảnh xác nhận đã đến địa chỉ lấy đồ giặt từ khách hàng:'
                    : 'Chụp hoặc tải ảnh giao trả túi đồ sạch cho khách hàng:'}
                </p>

                {/* File input button */}
                <label className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-2xl text-amber-300 text-xs font-bold cursor-pointer transition-all">
                  <Upload className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">
                    {selectedFile ? selectedFile.name : '📸 Chụp ảnh từ Camera / Chọn file'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>

                {/* Image Preview */}
                {previewUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950">
                    <img src={previewUrl} alt="Shipper Proof" className="w-full h-40 object-cover" />
                    <span className="absolute bottom-2 right-2 text-[9px] font-bold bg-slate-950/90 text-amber-300 px-2 py-1 rounded">
                      📸 Xem trước ảnh
                    </span>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>Xác Nhận</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
