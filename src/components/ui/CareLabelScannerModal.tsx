import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Upload, AlertCircle, Sparkles, HelpCircle, 
  Loader2, CheckCircle2, ShieldAlert, Camera, Check
} from 'lucide-react';
import { detectCareLabel, type AIDetectResponse } from '../../api/aiService';

interface CareLabelScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNote?: (note: string) => void;
  onSelectPackage?: (packageName: string, adviceText: string) => void;
}

export const CareLabelScannerModal: React.FC<CareLabelScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyNote,
  onSelectPackage
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIDetectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  // Kích hoạt dialog chọn file
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Gửi ảnh lên backend AI phân tích
  const handleScan = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await detectCareLabel(imageFile);
      if (response.success) {
        setResult(response);
      } else {
        setError('Không nhận diện được nhãn mác. Vui lòng chụp/chọn ảnh rõ nét hơn.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Đã xảy ra lỗi khi quét ảnh bằng AI. Vui lòng kiểm tra lại hình ảnh.');
    } finally {
      setIsLoading(false);
    }
  };

  // Tính toán gói giặt đề xuất dựa trên kết quả AI
  const getRecommendedPackage = (data: AIDetectResponse) => {
    const symbolClasses = data.detections.map(d => (d.class || '').toLowerCase());
    const adviceStr = (data.recommendation?.finalAdvice || []).join(' ').toLowerCase();
    const warningStr = (data.recommendation?.warnings || []).join(' ').toLowerCase();

    const isDryClean = symbolClasses.some(s => s.includes('dry_clean') || s.includes('dn_wash') || s.includes('do_not_wash')) ||
                       adviceStr.includes('giặt khô') || adviceStr.includes('giặt hấp') || warningStr.includes('không giặt nước');

    const isSpecial = symbolClasses.some(s => s.includes('hand_wash') || s.includes('dn_tumble_dry')) ||
                      adviceStr.includes('giặt tay') || adviceStr.includes('nhạy cảm') || adviceStr.includes('lụa') || adviceStr.includes('da');

    if (isDryClean) {
      return {
        category: 'dryclean',
        name: 'Giặt Hấp (Khô) Cao Cấp',
        badge: '👔 Gói Khuyên Dùng: Giặt Hấp (Khô)',
        price: 'Từ 45.000đ / chiếc',
        reason: 'AI phát hiện nhãn mác yêu cầu giặt hấp/giặt khô đặc biệt để tránh co rút hoặc hư hỏng chất vải.'
      };
    }

    if (isSpecial) {
      return {
        category: 'special',
        name: 'Giặt Nhẹ Chuyên Sâu & Chăm Sóc Vải',
        badge: '✨ Gói Khuyên Dùng: Chăm Sóc Vải Nhạy Cảm',
        price: 'Từ 60.000đ / gói',
        reason: 'AI phát hiện chất liệu mỏng nhẹ/giặt tay. Nên sử dụng gói chăm sóc nhẹ với nước giặt hữu cơ sinh học.'
      };
    }

    return {
      category: 'laundry',
      name: 'Giặt + Sấy Nhanh Hữu Cơ',
      badge: '⚡ Gói Khuyên Dùng: Giặt Sấy Tiêu Chuẩn',
      price: 'Từ 25.000đ / kg',
      reason: 'Quần áo phù hợp giặt sấy tiêu chuẩn. Quy trình tự động diệt khuẩn 99.9% và sấy khô lưu hương.'
    };
  };

  // Kiểu dáng badge cho ký hiệu
  const getSymbolBadgeStyle = (symbol: string) => {
    if (symbol.startsWith('DN_') || symbol.includes('do_not')) {
      return 'bg-rose-50 border-rose-200 text-rose-700';
    }
    if (symbol.includes('wash') || symbol.includes('30C') || symbol.includes('40C')) {
      return 'bg-blue-50 border-blue-200 text-[#1E4DB7]';
    }
    return 'bg-amber-50 border-amber-200 text-amber-800';
  };

  // Áp dụng ghi chú
  const handleApplyNoteOnly = () => {
    if (!result) return;
    const adviceText = `[Ghi chú AI Scan: ${result.recommendation.finalAdvice.join(' ')}]`;
    if (onApplyNote) onApplyNote(adviceText);
    onClose();
    resetState();
  };

  // Chọn gói dịch vụ đề xuất & áp dụng
  const handleSelectRecommended = () => {
    if (!result) return;
    const recPkg = getRecommendedPackage(result);
    const adviceText = `[Ghi chú AI Scan: Khuyên dùng ${recPkg.name}. ${result.recommendation.finalAdvice.join(' ')}]`;
    
    if (onSelectPackage) {
      onSelectPackage(recPkg.name, adviceText);
    } else if (onApplyNote) {
      onApplyNote(adviceText);
    }
    onClose();
    resetState();
  };

  const resetState = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
  };

  if (!isOpen) return null;

  const recPackage = result ? getRecommendedPackage(result) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white border border-blue-100 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-blue-50 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#1E4DB7] text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-none">
                  Trợ Lý AI Quét Nhãn Mác Quần Áo
                </h2>
                <p className="text-xs text-slate-500 mt-1">Tự động nhận diện chất liệu vải & gợi ý gói giặt ủi tối ưu</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {/* Upload area */}
            <div className="flex flex-col items-center justify-center">
              {!imagePreview ? (
                <div
                  onClick={triggerFileInput}
                  className="w-full border-2 border-dashed border-blue-200 hover:border-[#1E4DB7] bg-blue-50/40 hover:bg-blue-50/80 rounded-2xl p-8 text-center transition-all cursor-pointer group"
                >
                  <div className="w-14 h-14 bg-white rounded-2xl border border-blue-100 flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:scale-105 transition-transform">
                    <Camera className="w-7 h-7 text-[#1E4DB7]" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 mb-1">
                    Tải ảnh hoặc Chụp ảnh nhãn mác quần áo
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
                    Hỗ trợ định dạng JPG, PNG, WebP. Hãy đảm bảo chữ và các ký hiệu giặt trên nhãn rõ nét.
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E4DB7] text-white text-xs font-bold rounded-xl shadow-md group-hover:bg-[#1A42A0] transition-colors">
                    <Upload className="w-4 h-4" /> Chọn ảnh nhãn mác
                  </span>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-blue-100 bg-slate-50 max-h-56 flex items-center justify-center">
                    <img src={imagePreview} alt="Preview label" className="max-h-56 object-contain" />
                    <button
                      onClick={triggerFileInput}
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-slate-800 text-xs font-bold rounded-lg shadow-md border border-slate-200 hover:bg-white transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#1E4DB7]" /> Đổi ảnh khác
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-xs font-medium text-rose-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-9 h-9 text-[#1E4DB7] animate-spin" />
                <p className="text-xs font-bold text-[#1E4DB7]">Trí tuệ nhân tạo AI đang phân tích nhãn mác...</p>
                <p className="text-[11px] text-slate-400">Đang đối chiếu ký hiệu quốc tế & bảng tiêu chuẩn sợi vải</p>
              </div>
            )}

            {/* AI Results */}
            {result && recPackage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* 🌟 RECOMMENDED PACKAGE CARD */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50 border border-blue-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1E4DB7] bg-white border border-blue-200 px-3 py-1 rounded-full shadow-2xs">
                      {recPackage.badge}
                    </span>
                    <span className="text-xs font-black text-slate-900">{recPackage.price}</span>
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{recPackage.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{recPackage.reason}</p>
                  </div>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button
                      onClick={handleSelectRecommended}
                      className="px-4 py-2 bg-[#1E4DB7] hover:bg-[#1A42A0] text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Chọn gói dịch vụ này
                    </button>
                  </div>
                </div>

                {/* Detected Symbols */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Ký hiệu phát hiện được ({result.detections.length})
                  </h3>
                  {result.detections.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Không phát hiện ký hiệu chuẩn mờ đục.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.detections.map((det) => (
                        <div
                          key={det.class}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${getSymbolBadgeStyle(det.class)}`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{det.class} ({Math.round(det.confidence * 100)}%)</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Instructions List */}
                {result.recommendation.instructions.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">Ý nghĩa chi tiết ký hiệu</h3>
                    <div className="space-y-2">
                      {result.recommendation.instructions.map((inst, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-slate-700 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1E4DB7] mt-1.5 flex-shrink-0" />
                          <div>
                            <span className="font-mono text-[#1E4DB7] text-xs font-bold mr-1">[{inst.symbol}]</span>
                            <span>{inst.meaning}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings Alert */}
                {result.recommendation.warnings.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider">Lưu ý quan trọng (Warnings)</h3>
                    </div>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1 pl-1">
                      {result.recommendation.warnings.map((warn, idx) => (
                        <li key={idx} className="marker:text-rose-500 font-semibold">{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Final Advice Card */}
                {result.recommendation.finalAdvice.length > 0 && (
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#1E4DB7]" />
                      <h3 className="text-xs font-bold text-[#1E4DB7] uppercase tracking-wider">Lời khuyên xử lý giặt</h3>
                    </div>
                    <div className="text-xs text-slate-700 space-y-1 font-medium">
                      {result.recommendation.finalAdvice.map((adv, idx) => (
                        <p key={idx}>• {adv}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff Review Banner */}
                {result.needStaffReview && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">Cần nhân viên hỗ trợ kiểm tra thêm</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Hình ảnh nhãn mác hơi mờ. Nhân viên kiểm định Skill Up sẽ đối chiếu trực tiếp khi tiếp nhận đồ của bạn.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              {imagePreview && !result && !isLoading && (
                <button
                  onClick={handleScan}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold bg-[#1E4DB7] hover:bg-[#1A42A0] text-white shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Tiến Hành Phân Tích AI
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              >
                Đóng
              </button>
              {result && (
                <button
                  onClick={handleApplyNoteOnly}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-blue-200 text-[#1E4DB7] bg-blue-50 hover:bg-blue-100 transition-all shadow-xs cursor-pointer"
                >
                  Chỉ áp dụng Ghi chú
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
