import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  FileText,
  Loader,
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Users,
  ShieldCheck,
  Image as ImageIcon,
  Clock,
  Info,
  RefreshCw,
} from 'lucide-react';
import type { OrderDetail, OrderImage, OrderStatus, Staff } from '../../api/adminService';
import { CareLabelScannerModal } from '../ui/CareLabelScannerModal';


// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badge: string; dot: string; text: string }
> = {
  received:   { label: 'Đã nhận đơn', badge: 'bg-amber-50 text-amber-700 border border-amber-200',    dot: 'bg-amber-500',   text: 'text-amber-700'   },
  washing:    { label: 'Đang giặt',   badge: 'bg-cyan-50 text-cyan-700 border border-cyan-200',       dot: 'bg-cyan-500',    text: 'text-cyan-700'    },
  drying:     { label: 'Đang sấy',    badge: 'bg-orange-50 text-orange-700 border border-orange-200', dot: 'bg-orange-500',  text: 'text-orange-700'  },
  delivering: { label: 'Đang giao',   badge: 'bg-purple-50 text-purple-700 border border-purple-200', dot: 'bg-purple-500',  text: 'text-purple-700'  },
  completed:  { label: 'Hoàn thành',  badge: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  cancelled:  { label: 'Đã hủy',      badge: 'bg-rose-50 text-rose-700 border border-rose-200',       dot: 'bg-rose-500',    text: 'text-rose-700'    },
};

const ORDER_STATUS_LIST = Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
  value: value as OrderStatus,
  label: cfg.label,
}));

const StatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  if (!cfg) return <span className="text-xs text-slate-400">{status}</span>;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
      {cfg.label}
    </span>
  );
};

interface OrderDetailDrawerProps {
  selectedOrderId: string | null;
  detail: OrderDetail | null;
  images: OrderImage[];
  detailLoading: boolean;
  updating: boolean;
  staffList: Staff[];
  staffLoading: boolean;
  isAssigning: boolean;
  newStaffNote: string;
  adminNoteInput: string;
  isAddingNote: boolean;
  isSavingAdminNote: boolean;
  userRole?: string;
  onClose: () => void;
  onRefresh: () => void;
  onAssignStaff: (staffId: string) => void;
  onAddStaffNote: (e: React.FormEvent) => void;
  onStaffNoteChange: (val: string) => void;
  onAdminNoteChange: (val: string) => void;
  onSaveAdminNote: () => void;
  onConfirmStatus: (info: {
    orderId: string;
    orderCode: string;
    currentStatus: OrderStatus;
    newStatus: OrderStatus;
  }) => void;
}

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-start gap-2.5">
    <span className="text-slate-400 flex-shrink-0 mt-0.5">{icon}</span>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">
        {label}
      </p>
      <p className="text-xs font-semibold text-slate-700">{value || '—'}</p>
    </div>
  </div>
);

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  selectedOrderId,
  detail,
  images,
  detailLoading,
  updating,
  staffList,
  staffLoading,
  isAssigning,
  newStaffNote,
  adminNoteInput,
  isAddingNote,
  isSavingAdminNote,
  userRole,
  onClose,
  onRefresh,
  onAssignStaff,
  onAddStaffNote,
  onStaffNoteChange,
  onAdminNoteChange,
  onSaveAdminNote,
  onConfirmStatus,
}) => {
  const [isScannerOpen, setIsScannerOpen] = React.useState(false);

  const handleApplyAINote = (aiAdvice: string) => {
    onStaffNoteChange(newStaffNote ? `${newStaffNote} ${aiAdvice}` : aiAdvice);
  };

  return (

    <AnimatePresence>
      {selectedOrderId && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950 z-40"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 250 }}
            className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-cyan-600" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                    Chi tiết đơn hàng
                  </p>
                  <p className="font-mono text-sm font-bold text-slate-800 mt-0.5">
                    {detail ? `#${detail.orderCode}` : 'Đang tải...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {detail && <StatusBadge status={detail.status} />}
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {detailLoading ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 py-20">
                  <Loader className="w-8 h-8 animate-spin text-cyan-500" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Đang lấy dữ liệu...
                  </p>
                </div>
              ) : detail ? (
                <>
                  {/* Section 1: Customer */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      Khách hàng
                    </p>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-700 flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0">
                        {detail.customer?.name ? detail.customer.name.charAt(0).toUpperCase() : 'K'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm leading-none">
                          {detail.customer?.name || 'Khách lẻ'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {detail.customer?.createdAt
                            ? `Thành viên từ ${new Date(detail.customer.createdAt).toLocaleDateString('vi-VN')}`
                            : 'Khách lẻ'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      <InfoRow
                        icon={<Phone className="w-3.5 h-3.5" />}
                        label="Điện thoại"
                        value={detail.customer?.phone}
                      />
                      <InfoRow
                        icon={<Mail className="w-3.5 h-3.5" />}
                        label="Email"
                        value={detail.customer?.email}
                      />
                      <InfoRow
                        icon={<MapPin className="w-3.5 h-3.5" />}
                        label="Địa chỉ"
                        value={detail.customer?.address || 'Nhận tại cửa hàng'}
                      />
                    </div>
                  </div>

                  {/* Section 2: Service & Cost */}
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Dịch vụ & Thanh toán
                    </p>
                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 mr-3">
                            <p className="font-bold text-slate-800 text-sm">
                              {detail.service?.name || 'Dịch vụ giặt ủi'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1 leading-normal">
                              {detail.service?.description || 'Giặt giũ tiêu chuẩn'}
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-1 bg-slate-100 rounded-lg text-slate-500 flex-shrink-0">
                            {detail.service?.priceType === 'per_kg' ? 'Tính/Kg' : 'Tính/Món'}
                          </span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-xs border-t border-slate-100 pt-3">
                          <span className="text-slate-400">Đơn giá:</span>
                          <span className="font-semibold text-slate-600">
                            {detail.service?.price
                              ? `${detail.service.price.toLocaleString('vi-VN')} ₫`
                              : '—'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-cyan-50 to-sky-50 border-t border-slate-100 px-4 py-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          Tổng hóa đơn
                        </span>
                        <span className="text-lg font-bold text-cyan-600">
                          {(detail.totalPrice || detail.totalAmount || 0).toLocaleString('vi-VN')} ₫
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Staff Assignment */}
                  <div className="border-t border-slate-100 pt-4">
                    {userRole === 'admin' ? (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          Phân công nhân viên
                        </p>
                        <div className="flex gap-2">
                          <select
                            value={detail.staff?._id || ''}
                            onChange={(e) => onAssignStaff(e.target.value)}
                            disabled={isAssigning || staffLoading}
                            className="text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 flex-1 cursor-pointer disabled:opacity-50"
                          >
                            <option value="">-- Chưa phân công --</option>
                            {staffList.map((st) => (
                              <option key={st._id} value={st._id}>
                                {st.name} ({st.email})
                              </option>
                            ))}
                          </select>
                          {isAssigning && <Loader className="w-4 h-4 animate-spin text-cyan-500 self-center flex-shrink-0" />}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5" />
                          Nhân viên phụ trách
                        </p>
                        <div className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl">
                          {detail.staff?.name
                            ? `${detail.staff.name} — ${detail.staff.phone || 'Không có SĐT'}`
                            : 'Chưa được phân công'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Section 4: Admin Note */}
                  {userRole === 'admin' ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Ghi chú bảo mật Admin
                      </p>
                      <div className="flex gap-2">
                        <textarea
                          placeholder="Nhập ghi chú quan trọng hoặc cảnh báo VIP..."
                          value={adminNoteInput}
                          onChange={(e) => onAdminNoteChange(e.target.value)}
                          rows={2}
                          className="w-full text-xs font-medium text-slate-800 border border-slate-200 rounded-xl p-3 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all resize-none"
                        />
                        <button
                          onClick={onSaveAdminNote}
                          disabled={isSavingAdminNote || adminNoteInput.trim() === (detail.adminNote || '')}
                          className="px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40 h-10 self-end flex-shrink-0"
                        >
                          {isSavingAdminNote ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Lưu'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    detail.adminNote && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          Chỉ thị từ Admin
                        </p>
                        <div className="text-xs bg-rose-50 border border-rose-100 rounded-xl p-3 text-rose-700 font-semibold leading-normal">
                          {detail.adminNote}
                        </div>
                      </div>
                    )
                  )}

                  {/* Section 5: Images */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Hình ảnh trước & sau giặt ({images.length})
                    </p>
                    {images.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                        <p className="text-xs text-slate-400">Chưa có ảnh nào được tải lên</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {images.map((img) => (
                          <div
                            key={img._id}
                            className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group"
                          >
                            <img
                              src={img.imageUrl || (img as any).url}
                              alt="Laundry"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Section 6: Staff Notes */}
                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        Ghi chú nghiệp vụ
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsScannerOpen(true)}
                        className="text-[11px] text-white font-bold flex items-center gap-1 cursor-pointer transition-all bg-cyan-600 hover:bg-cyan-500 px-2.5 py-1.5 rounded-lg shadow-sm"
                      >
                        🤖 Quét nhãn AI
                      </button>
                    </div>

                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                      {!detail.staffNotes || detail.staffNotes.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Chưa có ghi chú nào.</p>
                      ) : (
                        detail.staffNotes.map((nt, idx) => (
                          <div
                            key={idx}
                            className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs space-y-1"
                          >
                            <p className="text-slate-700 font-semibold leading-normal">{nt.content}</p>
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-medium">
                              <span>
                                Bởi:{' '}
                                <span className="font-bold text-slate-500">
                                  {nt.createdBy?.name || 'Staff'} ({nt.createdBy?.role})
                                </span>
                              </span>
                              <span>{new Date(nt.createdAt).toLocaleString('vi-VN')}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <form onSubmit={onAddStaffNote} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Viết ghi chú (VD: áo sơ mi bị lem màu...)"
                        value={newStaffNote}
                        onChange={(e) => onStaffNoteChange(e.target.value)}
                        disabled={isAddingNote}
                        className="w-full text-xs font-medium text-slate-800 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:bg-white transition-all placeholder-slate-400"
                      />
                      <button
                        type="submit"
                        disabled={isAddingNote || !newStaffNote.trim()}
                        className="px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40 flex-shrink-0"
                      >
                        {isAddingNote ? <Loader className="w-3.5 h-3.5 animate-spin" /> : 'Gửi'}
                      </button>
                    </form>
                  </div>

                  {/* Section 7: Status Timeline */}
                  <div className="border-t border-slate-100 pt-4 space-y-3 pb-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      Lịch sử trạng thái
                    </p>
                    <div className="relative pl-5 border-l-2 border-slate-100 space-y-4 py-1 ml-2">
                      {!detail.statusHistory || detail.statusHistory.length === 0 ? (
                        <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                          <Info className="w-3.5 h-3.5" />
                          Chưa có lịch sử cập nhật
                        </div>
                      ) : (
                        detail.statusHistory.map((hist, idx) => {
                          const cfg = STATUS_CONFIG[hist.status];
                          return (
                            <div key={idx} className="relative">
                              <div
                                className={`absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full ${
                                  cfg?.dot || 'bg-slate-300'
                                } ring-4 ring-white`}
                              />
                              <div className="text-xs space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`font-bold ${cfg?.text || 'text-slate-600'}`}>
                                    {cfg?.label || hist.status}
                                  </span>
                                  {hist.updatedBy && (
                                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                      bởi: {hist.updatedBy.name} ({hist.updatedBy.role})
                                    </span>
                                  )}
                                </div>
                                {hist.note && (
                                  <p className="text-slate-500 text-[11px] italic">
                                    "{hist.note}"
                                  </p>
                                )}
                                <span className="text-[9px] text-slate-400 font-semibold block">
                                  {new Date(hist.updatedAt).toLocaleString('vi-VN')}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <CareLabelScannerModal
                    isOpen={isScannerOpen}
                    onClose={() => setIsScannerOpen(false)}
                    onApplyNote={handleApplyAINote}
                  />
                </>
              ) : null}

            </div>

            {/* Footer */}
            {detail && (
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={onRefresh}
                  className="p-2.5 text-slate-500 hover:text-cyan-600 hover:bg-white rounded-xl border border-slate-200 hover:shadow-sm transition-all"
                  title="Làm mới"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <div className="flex-1">
                  <select
                    value={detail.status}
                    disabled={updating || detail.status === 'cancelled' || detail.status === 'completed'}
                    onChange={(e) =>
                      onConfirmStatus({
                        orderId: detail._id,
                        orderCode: detail.orderCode,
                        currentStatus: detail.status,
                        newStatus: e.target.value as OrderStatus,
                      })
                    }
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer disabled:opacity-50"
                  >
                    {ORDER_STATUS_LIST.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
