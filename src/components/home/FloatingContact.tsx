import React from 'react';
import { motion } from 'framer-motion';
import { PhoneCall } from 'lucide-react';

const HOTLINE = '0901234567'; // Thay số thật của shop vào đây
const ZALO_URL = `https://zalo.me/${HOTLINE}`;

export const FloatingContact: React.FC = () => {
  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-3 items-end">

      {/* Zalo button */}
      <motion.a
        href={ZALO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat Zalo"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.5, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        className="group flex items-center gap-2.5 bg-[#0068ff] text-white rounded-full shadow-lg shadow-blue-500/40 hover:shadow-blue-500/60 transition-shadow duration-300 pl-4 pr-3 py-2.5"
      >
        {/* Tooltip label */}
        <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">
          Chat Zalo
        </span>
        {/* Zalo icon */}
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 48 48" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M24 2C11.85 2 2 11.85 2 24c0 4.83 1.55 9.3 4.18 12.95L4 44l7.38-2.12A21.9 21.9 0 0 0 24 46c12.15 0 22-9.85 22-22S36.15 2 24 2zm0 3c10.48 0 19 8.52 19 19s-8.52 19-19 19c-3.68 0-7.12-1.04-10.02-2.84l-.55-.34-5.72 1.65 1.68-5.56-.37-.58A18.94 18.94 0 0 1 5 24c0-10.48 8.52-19 19-19zm-7.5 10.5v13.5h3V16.5h-3zm5 0v13.5h3V23l5 7.5h3V16.5h-3v7l-5-7h-3zm-8 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
          </svg>
        </div>
        {/* Pulsing ring */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white" />
      </motion.a>

      {/* Phone button */}
      <motion.a
        href={`tel:${HOTLINE}`}
        aria-label="Gọi điện"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.7, type: 'spring', stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        className="relative group flex items-center gap-2.5 bg-cyan-500 text-white rounded-full shadow-lg shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-shadow duration-300 p-2 sm:pl-4 sm:pr-3 sm:py-2.5"
      >
        <span className="hidden sm:inline text-xs font-semibold whitespace-nowrap">
          {HOTLINE.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')}
        </span>
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
          <PhoneCall className="w-4 h-4" />
        </div>
        {/* Ripple animation */}
        <motion.span
          className="absolute inset-0 rounded-full bg-cyan-400/30"
          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
        />
      </motion.a>

    </div>
  );
};
