import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
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
  X,
  Plus,
  Minus,
  Sparkle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { getAllServices, type LaundryService } from '../../api/serviceService';
import { createOrder, type Order } from '../../api/orderService';

/* ─── 1. Zod Validation Schema chống spam thông tin rác & bắt buộc chọn dịch vụ ─── */
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

  serviceId: z.string().min(1, { message: 'Vui lòng chọn gói dịch vụ' }),
  
  quantity: z.number().min(0.5, { message: 'Số lượng giặt sấy tối thiểu là 0.5' }),
});

export type OrderFormData = z.infer<typeof orderSchema>;

/* ─── 2. Component BookingFormSection ───────────────────────────────────────── */
export const BookingFormSection: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [services, setServices] = useState<LaundryService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Tính ngày hôm nay format YYYY-MM-DD cho min attribute của date input
  const todayStr = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      fullName: user?.name || '',
      phone: user?.phone || '',
      address: '',
      bookingDate: todayStr,
      bookingTime: '08:00 - 10:00',
      note: '',
      serviceId: '',
      quantity: 1,
    },
  });

  // Tự động điền họ tên/SĐT nếu user đã đăng nhập
  useEffect(() => {
    if (user) {
      setValue('fullName', user.name || '');
      if (user.phone) {
        setValue('phone', user.phone);
      }
    }
  }, [user, setValue]);

  // Listen for external service selection (e.g. from PricingSection)
  useEffect(() => {
    const handleSelectService = (event: Event) => {
      const customEvent = event as CustomEvent<{ serviceId: string }>;
      if (customEvent.detail && customEvent.detail.serviceId) {
        setValue('serviceId', customEvent.detail.serviceId);
      }
    };

    window.addEventListener('select-booking-service', handleSelectService);
    return () => {
      window.removeEventListener('select-booking-service', handleSelectService);
    };
  }, [setValue]);

  // Load danh sách dịch vụ hoạt động
  useEffect(() => {
    getAllServices()
      .then(data => {
        const activeServices = data.filter(s => s.isActive);
        setServices(activeServices);
        if (activeServices.length > 0) {
          setValue('serviceId', activeServices[0]._id);
        }
      })
      .catch(err => console.error('Lỗi tải danh mục dịch vụ:', err))
      .finally(() => setServicesLoading(false));
  }, [setValue]);

  // Lắng nghe giá trị serviceId và quantity để tính toán giá tạm thời
  const selectedServiceId = watch('serviceId');
  const quantityValue = watch('quantity') || 1;
  const currentService = services.find(s => s._id === selectedServiceId);
  const estimatedPrice = currentService ? currentService.price * quantityValue : 0;

  const handleIncrement = () => {
    const step = currentService?.priceType === 'per_kg' ? 0.5 : 1;
    setValue('quantity', Number((quantityValue + step).toFixed(1)));
  };

  const handleDecrement = () => {
    const step = currentService?.priceType === 'per_kg' ? 0.5 : 1;
    if (quantityValue > step) {
      setValue('quantity', Number((quantityValue - step).toFixed(1)));
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!isAuthenticated) {
      setApiError('Bạn cần đăng nhập để thực hiện đặt lịch.');
      return;
    }
    
    setApiError(null);
    try {
      // Map khung giờ sang giờ bắt đầu
      const timeMap: Record<string, string> = {
        '08:00 - 10:00': '08:00:00',
        '10:00 - 12:00': '10:00:00',
        '13:30 - 15:30': '13:30:00',
        '15:30 - 17:30': '15:30:00',
        '17:30 - 19:30': '17:30:00',
      };
      
      const timeStr = timeMap[data.bookingTime] || '08:00:00';
      const scheduledPickupTime = new Date(`${data.bookingDate}T${timeStr}`).toISOString();

      const newOrder = await createOrder({
        serviceId: data.serviceId,
        quantity: data.quantity,
        pickupAddress: data.address,
        deliveryAddress: data.address, // Lấy đâu giao đó
        scheduledPickupTime,
        note: data.note || undefined,
      });

      setCreatedOrder(newOrder);
      setIsSuccessModalOpen(true);
      
      // Reset form giữ lại thông tin người dùng
      reset({
        fullName: user?.name || '',
        phone: user?.phone || '',
        address: data.address,
        bookingDate: todayStr,
        bookingTime: '08:00 - 10:00',
        note: '',
        serviceId: selectedServiceId,
        quantity: 1,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể kết nối máy chủ để đặt lịch. Vui lòng thử lại sau.';
      setApiError(msg);
    }
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
            <div className="lg:col-span-5 p-8 sm:p-12 lg:p-14 flex flex-col justify-center space-y-8 bg-gradient-to-br from-white to-[#FAF6F0]/30">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C5A880]/10 text-[#8E7A58] border border-[#EBE3D5] rounded-full text-xs font-semibold uppercase tracking-wider mb-5">
                  <PackageCheck className="w-3.5 h-3.5" /> Đặt lịch siêu tốc
                </span>
                <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2A2520] leading-tight">
                  Nhận đồ tại nhà
                  <br />
                  <span className="gradient-text">chỉ 1 phút đăng ký</span>
                </h2>
                <p className="mt-4 text-[#756458] text-sm leading-relaxed">
                  Shipper Skill-Up đến lấy đồ tận cửa theo khung giờ bạn chọn. Báo giá minh bạch, giao đồ thơm tho tận nhà.
                </p>
              </div>

              {/* Step indicator */}
              <div className="space-y-4 pt-2">
                {[
                  { icon: <Calendar className="w-4 h-4" />, step: '01', label: 'Chọn thời gian nhận đồ' },
                  { icon: <Calculator className="w-4 h-4" />, step: '02', label: 'Báo giá & cân đo tận mắt' },
                  { icon: <Sparkles className="w-4 h-4" />, step: '03', label: 'Nhận đồ sạch thơm tận cửa' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-[#EBE3D5]/40 shadow-xs">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/20">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-[#8F7E71] font-bold uppercase tracking-widest">Bước {item.step}</p>
                      <p className="text-sm font-semibold text-[#2A2520] truncate">{item.label}</p>
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

                {apiError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Họ và tên */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Họ và tên <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <input
                        {...register('fullName')}
                        type="text"
                        placeholder="Nguyễn Văn A"
                        style={{ paddingLeft: '2.75rem' }}
                        className={`w-full pr-4 py-2.5 bg-white border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                          errors.fullName
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-200 focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20'
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
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <input
                        {...register('phone')}
                        type="tel"
                        maxLength={10}
                        placeholder="0901 234 567"
                        style={{ paddingLeft: '2.75rem' }}
                        className={`w-full pr-4 py-2.5 bg-white border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                          errors.phone
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-200 focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20'
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

                {/* Chọn Dịch vụ từ DB */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Chọn gói dịch vụ <span className="text-rose-500">*</span>
                    </label>
                    <select
                      {...register('serviceId')}
                      disabled={servicesLoading}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all cursor-pointer disabled:bg-slate-100"
                    >
                      {servicesLoading ? (
                        <option>Đang tải danh sách dịch vụ...</option>
                      ) : (
                        services.map(s => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.price.toLocaleString('vi-VN')}đ/{s.priceType === 'per_kg' ? 'kg' : 'món'})
                          </option>
                        ))
                      )}
                    </select>
                    {errors.serviceId && (
                      <p className="text-xs text-rose-500 font-medium">{errors.serviceId.message}</p>
                    )}
                  </div>

                  {/* Nhập số lượng với nút tăng/giảm */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Khối lượng ({currentService?.priceType === 'per_kg' ? 'kg' : 'món'}) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center h-[42px] bg-white border border-slate-200 rounded-xl px-2">
                      <button
                        type="button"
                        onClick={handleDecrement}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        step={currentService?.priceType === 'per_kg' ? 0.5 : 1}
                        {...register('quantity', { valueAsNumber: true })}
                        className="w-full text-center bg-transparent border-0 focus:outline-none focus:ring-0 text-sm font-bold text-slate-805"
                      />
                      <button
                        type="button"
                        onClick={handleIncrement}
                        className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {errors.quantity && (
                      <p className="text-xs text-rose-500 font-medium">{errors.quantity.message}</p>
                    )}
                  </div>
                </div>

                {/* Địa chỉ nhận đồ */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Địa chỉ nhận & giao đồ tận nơi <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <input
                      {...register('address')}
                      type="text"
                      placeholder="Ghi rõ: Số nhà, Đường, Phường/Xã, Quận/Huyện..."
                      style={{ paddingLeft: '2.75rem' }}
                      className={`w-full pr-4 py-2.5 bg-white border rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all ${
                        errors.address
                          ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                          : 'border-slate-200 focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20'
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
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <input
                        {...register('bookingDate')}
                        type="date"
                        min={todayStr}
                        style={{ paddingLeft: '2.75rem' }}
                        className={`w-full pr-4 py-2.5 bg-white border rounded-xl text-sm text-slate-800 focus:outline-none transition-all cursor-pointer ${
                          errors.bookingDate
                            ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                            : 'border-slate-200 focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20'
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
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                      <select
                        {...register('bookingTime')}
                        style={{ paddingLeft: '2.75rem' }}
                        className="w-full pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all cursor-pointer"
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
                    <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 pointer-events-none z-10" />
                    <textarea
                      {...register('note')}
                      rows={2}
                      placeholder="Ví dụ: Đồ mỏng giặt nhẹ, gọi trước 15 phút..."
                      style={{ paddingLeft: '2.75rem' }}
                      className="w-full pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all resize-none"
                    />
                  </div>
                  {errors.note && (
                    <p className="text-xs text-rose-500 font-medium">{errors.note.message}</p>
                  )}
                </div>

                {/* Hiển thị Tổng Tiền Tạm Tính */}
                {estimatedPrice > 0 && (
                  <div className="p-3 bg-[#C5A880]/5 border border-[#C5A880]/15 rounded-2xl flex items-center justify-between">
                    <span className="text-xs font-bold text-[#756458] flex items-center gap-1">
                      <Sparkle className="w-3.5 h-3.5 text-[#C5A880] animate-spin-slow" />
                      Chi phí tạm tính:
                    </span>
                    <strong className="text-base font-black text-[#C5A880]">
                      {estimatedPrice.toLocaleString('vi-VN')}đ
                    </strong>
                  </div>
                )}

                {/* Nút Submit Chống Spam Click */}
                {isAuthenticated ? (
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={isSubmitting}
                    className="py-3.5 text-white bg-gradient-to-r from-[#BCA374] to-[#C5A880] hover:from-[#C5A880] hover:to-[#D4AF37] shadow-md shadow-gold-500/10 hover:shadow-gold-500/20 rounded-xl font-bold transition-all duration-300 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Đang gửi yêu cầu...</span>
                      </>
                    ) : (
                      <span>Gửi Yêu Cầu Đặt Lịch</span>
                    )}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    onClick={() => navigate('/login')}
                    className="py-3.5 text-white bg-gradient-to-r from-slate-850 to-slate-750 hover:from-slate-750 hover:to-slate-650 shadow-md rounded-xl font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Đăng nhập để đặt lịch dịch vụ</span>
                  </Button>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Thông Báo Đặt Lịch Thành Công ─────────────────────── */}
      {isSuccessModalOpen && createdOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5">
            <button
              onClick={() => setIsSuccessModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-all cursor-pointer"
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
                Hệ thống đã ghi nhận lịch hẹn lấy đồ. Vui lòng ghi nhớ mã đơn hàng dưới đây để tra cứu tiến độ.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-[#C5A880] text-sm select-all">
                  {createdOrder.orderCode}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Dịch vụ:</span>
                <span className="font-semibold text-slate-800">
                  {currentService?.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Số lượng:</span>
                <span className="font-semibold text-slate-800">
                  {createdOrder.quantity} {currentService?.priceType === 'per_kg' ? 'kg' : 'món'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                <span className="text-slate-500">Thành tiền:</span>
                <span className="font-bold text-emerald-600">
                  {createdOrder.totalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Địa chỉ:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[60%] text-right">
                  {createdOrder.pickupAddress}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => {
                  setIsSuccessModalOpen(false);
                  navigate('/products'); // hoặc trang list đơn hàng nếu có
                }}
                className="py-3 border border-slate-200 text-slate-700 font-bold rounded-xl"
              >
                Về danh sách
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => setIsSuccessModalOpen(false)}
                className="py-3 bg-[#C5A880] hover:bg-[#BCA374] text-white font-bold rounded-xl shadow-md"
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
