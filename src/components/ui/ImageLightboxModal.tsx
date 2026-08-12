import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { getImageUrl } from '../../api/orderService';

interface ImageLightboxModalProps {
  imageUrl: string | null;
  caption?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  imageUrl,
  caption,
  onClose,
}) => {
  if (!imageUrl) return null;

  const fullUrl = getImageUrl(imageUrl);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/90 backdrop-blur-md cursor-pointer"
        />

        {/* Content Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl p-3 sm:p-4 shadow-2xl z-10 flex flex-col items-center overflow-hidden"
        >
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between px-3 py-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold text-amber-300 truncate max-w-[260px] sm:max-w-md">
              {caption || '📸 Xem ảnh xác thực'}
            </span>
            <div className="flex items-center gap-2">
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="Mở tab mới"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Image View */}
          <div className="w-full flex-grow flex items-center justify-center min-h-[250px] max-h-[75vh] overflow-auto rounded-2xl bg-slate-950/60 p-2 border border-slate-800/60">
            <img
              src={fullUrl}
              alt={caption || 'Ảnh xác thực'}
              className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
              onError={(e) => {
                // Fallback nếu ảnh bị hỏng
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/600x400/1e293b/f59e0b?text=Anh+xac+thuc+Skill-Up';
              }}
            />
          </div>

          {/* Bottom Bar */}
          <div className="w-full text-center pt-2 text-[11px] text-slate-400 font-mono">
            {fullUrl}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
