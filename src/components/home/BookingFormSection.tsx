import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  PackageCheck,
  Calculator,
  Sparkles,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';

/* ─── 1. Zod Validation Schema chống spam thông tin rác ────────────────────── */
export const orderSchema = z.object({
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
    .min(1, { message: 'Vui lòng chọn ngày hẹn nhận đồ' })
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

  bookingTime: z.string().min(1, { message: 'Vui lòng chọn khung giờ nhận đồ' }),

  note: z.string().max(200, { message: 'Ghi chú tối đa 200 ký tự' }).optional(),
});

export type OrderFormData = z.infer<typeof orderSchema>;

/* ─── 2. Component BookingFormSection ───────────────────────────────────────── */
export const BookingFormSection: React.FC = () => {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState<OrderFormData | null>(null);

  // Tính ngày hôm nay format YYYY-MM-DD cho min attribute của date input
  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      bookingDate: todayStr,
      bookingTime: '08:00 - 10:00',
      note: '',
    },
  });

  const onSubmit = async (data: OrderFormData) => {
    // Giả lập thời gian gửi API 1.5 giây chống spam click
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmittedData(data);
    setIsSuccessModalOpen(true);
    reset();
  };

  return (
    <section id="quick-booking" className="py-20 lg:py-28 bg-slate-50 relative overflow-hidden">
      <div className="w-full max-w-7xl 2xl:max-w-[1536px] 4xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="relative rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-100/60">
          
          {/* Top accent line */}
          <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-amber-400" />

          {/* Background ambient blobs */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-50/60 rounded-full filter blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-50/50 rounded-full filter blur-[80px] pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-0">
            
            {/* ── Left Column: Intro & Steps (5 cols) ────────────────────── */}
            <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 flex flex-col justify-center space-y-8 bg-gradient-to-br from-white to-cyan-50/20">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-100 rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                  <PackageCheck className="w-3.5 h-3.5" /> Đặt lịch siêu tốc
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-slate-900 leading-tight">
                  Nhận đồ tại nhà
                  <br />
                  <span className="gradient-text">chỉ 1 phút đăng ký</span>
                </h2>
                <p className="mt-4 text-slate-500 text-sm leading-relaxed">
                  Shipper FreshWash đến lấy đồ tận cửa theo khung giờ bạn chọn. Báo giá minh bạch, giao đồ thơm tho tận nhà.
                </p>
              </div>

              {/* Step indicator */}
              <div className="space-y-4 pt-2">
                {[
                  { icon: <Calendar className="w-4 h-4" />, step: '01', label: 'Chọn thời gian nhận đồ', color: 'cyan' },
                  { icon: <Calculator className="w-4 h-4" />, step: '02', label: 'Báo giá & cân đo tận mắt', color: 'amber' },
                  { icon: <Sparkles className="w-4 h-4" />, step: '03', label: 'Nhận đồ sạch thơm tận cửa', color: 'cyan' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4 p-3 rounded-2xl bg-white/80 border border-slate-100 shadow-xs">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      item.color === 'cyan'
                        ? 'bg-cyan-50 text-cyan-600 border border-cyan-100'
                        : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bước {item.step}</p>
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right Column: React Hook Form (7 cols) ─────────────────── */}
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 bg-slate-50/50 border-t lg:border-t-0 lg:border-l border-slate-100 flex items-center">
              <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
                <div className="mb-2">
                  <h3 className="font-display font-bold text-2xl text-slate-900">
                    Thông Tin Đặt Lịch
                  </h3>
                  <p className="text-slate-500 text-xs mt-1">
                    Vui lòng điền đúng thông tin chính xác để nhân viên giao nhận hỗ trợ nhanh nhất.
                  </p>
                </div>

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Họ và tên */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('fullName')}
                        type="text"
                        placeholder="Nguyễn Văn A"
                        className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                          errors.fullName
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="flex items-center gap-1.5 text-xs text-rose-500 font-medium pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{errors.fullName.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Số điện thoại */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Số điện thoại <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('phone')}
                        type="tel"
                        maxLength={10}
                        placeholder="0901 234 567"
                        className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                          errors.phone
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="flex items-center gap-1.5 text-xs text-rose-500 font-medium pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{errors.phone.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Địa chỉ nhận đồ */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Địa chỉ nhận đồ tận nơi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      {...register('address')}
                      type="text"
                      placeholder="Ghi rõ: Số nhà, Đường, Phường/Xã, Quận/Huyện..."
                      className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.address
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                      }`}
                    />
                  </div>
                  {errors.address && (
                    <p className="flex items-center gap-1.5 text-xs text-rose-500 font-medium pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errors.address.message}</span>
                    </p>
                  )}
                </div>

                {/* Grid Ngày & Giờ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Ngày hẹn */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Ngày hẹn lấy đồ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        {...register('bookingDate')}
                        type="date"
                        min={todayStr}
                        className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm text-slate-800 focus:outline-none transition-all cursor-pointer ${
                          errors.bookingDate
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
                        }`}
                      />
                    </div>
                    {errors.bookingDate && (
                      <p className="flex items-center gap-1.5 text-xs text-rose-500 font-medium pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{errors.bookingDate.message}</span>
                      </p>
                    )}
                  </div>

                  {/* Giờ nhận */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Khung giờ hẹn <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        {...register('bookingTime')}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all cursor-pointer"
                      >
                        <option value="08:00 - 10:00">08:00 – 10:00 (Sáng)</option>
                        <option value="10:00 - 12:00">10:00 – 12:00 (Trưa)</option>
                        <option value="13:30 - 15:30">13:30 – 15:30 (Chiều)</option>
                        <option value="15:30 - 17:30">15:30 – 17:30 (Chiều tối)</option>
                        <option value="17:30 - 19:30">17:30 – 19:30 (Tối)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Ghi chú */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Ghi chú thêm (Nếu có)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      {...register('note')}
                      rows={2}
                      placeholder="Ví dụ: Đồ mỏng giặt nhẹ, gọi trước 15 phút..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
                    />
                  </div>
                  {errors.note && (
                    <p className="text-xs text-rose-500 font-medium">{errors.note.message}</p>
                  )}
                </div>

                {/* Nút Submit Chống Spam Click */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting}
                  className="py-3.5 text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 rounded-xl font-bold transition-all duration-300 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang xử lý yêu cầu...</span>
                    </>
                  ) : (
                    <span>Gửi Yêu Cầu Đặt Lịch</span>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Thông Báo Đặt Lịch Thành Công ─────────────────────── */}
      {isSuccessModalOpen && submittedData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                Đặt Lịch Thành Công!
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                FreshWash đã nhận thông tin. Nhân viên sẽ liên hệ lại số điện thoại{' '}
                <strong className="text-slate-800">{submittedData.phone}</strong> để xác nhận lấy đồ.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Khách hàng:</span>
                <span className="font-semibold text-slate-800">{submittedData.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Ngày & Giờ hẹn:</span>
                <span className="font-semibold text-slate-800">
                  {submittedData.bookingDate} ({submittedData.bookingTime})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Địa chỉ lấy:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[60%] text-right">
                  {submittedData.address}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              fullWidth
              onClick={() => setIsSuccessModalOpen(false)}
              className="py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md"
            >
              Đóng Thông Báo
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};
