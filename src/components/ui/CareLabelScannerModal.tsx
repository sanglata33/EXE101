import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Camera, Upload, AlertCircle, Sparkles, HelpCircle, 
  Loader2, CheckCircle2, ShieldAlert 
} from 'lucide-react';
import { detectCareLabel, type AIDetectResponse } from '../../api/aiService';

interface CareLabelScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyNote: (note: string) => void;
}

export const CareLabelScannerModal: React.FC<CareLabelScannerModalProps> = ({
  isOpen,
  onClose,
  onApplyNote
}) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AIDetectResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Xử lý khi chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  // Kích hoạt click input file ẩn
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Gửi ảnh lên backend để AI phân tích
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
        setError('Không nhận diện được nhãn mác. Vui lòng thử lại ảnh rõ nét hơn.');
      }
    } catch (err: unknown) {
      console.error(err);
      setError('Đã xảy ra lỗi trong quá trình quét ảnh. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Định nghĩa màu sắc biểu tượng dựa trên loại ký hiệu
  const getSymbolBadgeStyle = (symbol: string) => {
    if (symbol.startsWith('DN_')) {
      return 'bg-red-500/10 border-red-500/30 text-red-400';
    }
    if (symbol.includes('wash') || symbol.includes('30C') || symbol.includes('40C') || symbol.includes('50C')) {
      return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400';
    }
    return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
  };

  // Áp dụng lời khuyên AI vào ghi chú của đơn hàng
  const handleApply = () => {
    if (!result) return;
    const adviceText = `[Đề xuất từ AI: ${result.recommendation.finalAdvice.join(' ')}]`;
    onApplyNote(adviceText);
    onClose();
    // Reset state
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop che */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Thân Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-slate-100">Trợ Lý Quét Nhãn Giặt AI</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            {/* Upload Area / Image Preview */}
            <div className="flex flex-col items-center justify-center">
              {!imagePreview ? (
                // Chưa chọn ảnh -> Vùng drag drop
                <div
                  onClick={triggerFileInput}
                  className="w-full h-56 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl flex flex-col items-center justify-center gap-3 bg-slate-950/40 hover:bg-slate-950/60 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-cyan-400 group-hover:bg-cyan-500/10 transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-300">Tải ảnh nhãn mác lên</p>
                    <p className="text-xs text-slate-500 mt-1">Kéo thả ảnh hoặc click để chọn ảnh</p>
                  </div>
                </div>
              ) : (
                // Đã chọn ảnh -> Hiện preview
                <div className="relative w-full max-w-md h-56 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                  <img
                    src={imagePreview}
                    alt="Care Label"
                    className="max-w-full max-h-full object-contain"
                  />
                  
                  {/* Hiệu ứng tia quét khi đang AI Loading */}
                  {isLoading && (
                    <motion.div
                      initial={{ y: -112 }}
                      animate={{ y: 112 }}
                      transition={{
                        repeat: Infinity,
                        repeatType: 'reverse',
                        duration: 1.5,
                        ease: 'easeInOut'
                      }}
                      className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                    />
                  )}

                  {/* Nút xóa ảnh */}
                  {!isLoading && (
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setResult(null);
                        setError(null);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-800 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-6 gap-3">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                <p className="text-sm font-medium text-slate-400">Trí tuệ nhân tạo đang phân tích nhãn mác...</p>
              </div>
            )}

            {/* AI Results */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Detected Symbols */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Ký hiệu nhận diện ({result.detections.length})</h3>
                  {result.detections.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Không phát hiện ký hiệu nào rõ ràng.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {result.detections.map((det) => (
                        <div
                          key={det.class}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 ${getSymbolBadgeStyle(det.class)}`}
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
                  <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ý nghĩa ký hiệu</h3>
                    <div className="space-y-2">
                      {result.recommendation.instructions.map((inst, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-slate-300 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 mt-2 flex-shrink-0" />
                          <div>
                            <span className="font-mono text-cyan-400 text-xs font-semibold mr-1.5">[{inst.symbol}]</span>
                            <span>{inst.meaning}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings Alert */}
                {result.recommendation.warnings.length > 0 && (
                  <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">Cảnh Báo Giặt Ủi (Warnings)</h3>
                    </div>
                    <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 pl-1">
                      {result.recommendation.warnings.map((warn, idx) => (
                        <li key={idx} className="marker:text-red-400">{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Final Advice Card */}
                {result.recommendation.finalAdvice.length > 0 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-900 via-cyan-950/10 to-cyan-950/20 border border-cyan-500/20 space-y-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Khuyến nghị xử lý</h3>
                    </div>
                    <div className="text-sm text-slate-200 space-y-1.5">
                      {result.recommendation.finalAdvice.map((adv, idx) => (
                        <p key={idx}>{adv}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff Review Banner */}
                {result.needStaffReview && (
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                    <HelpCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-400">Yêu cầu nhân viên kiểm tra lại</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Hình ảnh có ký hiệu bị mờ hoặc độ tin cậy thấp. Hệ thống AI khuyên bạn nên bàn giao trực tiếp để nhân viên xác nhận tại cửa hàng trước khi giặt.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-950/20">
            <div>
              {imagePreview && !result && !isLoading && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScan}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Tiến Hành Phân Tích
                </motion.button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
              >
                Đóng
              </button>
              {result && (
                <button
                  onClick={handleApply}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-md shadow-cyan-500/15 cursor-pointer"
                >
                  Áp dụng vào Ghi chú
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
