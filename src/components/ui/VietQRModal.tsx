import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  QrCode,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Building2,
  User,
  FileText,
  DollarSign,
  Smartphone,
} from 'lucide-react';
import type { BankInfo } from '../../api/paymentService';
import { getPaymentByOrder } from '../../api/paymentService';

interface VietQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderCode: string;
  amount: number;
  qrCodeUrl: string;
  bankInfo?: BankInfo | null;
  onPaymentSuccess?: () => void;
}

export const VietQRModal: React.FC<VietQRModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderCode,
  amount,
  qrCodeUrl,
  bankInfo,
  onPaymentSuccess,
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [isPaid, setIsPaid]               = useState(false);
  const [isPolling, setIsPolling]         = useState(true);
  const pollTimerRef                       = useRef<ReturnType<typeof setInterval> | null>(null);

  const bankName = bankInfo?.bankId || 'MBBank';
  const accountNo = bankInfo?.accountNo || '0123456789';
  const accountName = bankInfo?.accountName || 'LAUNDRY SERVICE';
  const transferContent = bankInfo?.transferContent || orderCode;

  // Format currency
  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);

  // Copy helper
  const handleCopy = (text: string, type: 'account' | 'content') => {
    navigator.clipboard.writeText(text);
    if (type === 'account') {
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2000);
    } else {
      setCopiedContent(true);
      setTimeout(() => setCopiedContent(false), 2000);
    }
  };

  // Check payment status periodically (Polling fallback)
  useEffect(() => {
    if (!isOpen || isPaid) return;

    const checkStatus = async () => {
      try {
        const payment = await getPaymentByOrder(orderId);
        if (payment && payment.status === 'paid') {
          setIsPaid(true);
          setIsPolling(false);
        }
      } catch (err) {
        // Silently ignore poll errors
      }
    };

    checkStatus();
    pollTimerRef.current = setInterval(checkStatus, 3000);

    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [isOpen, isPaid, orderId]);

  // Real-time listener (fallback qua window.io nếu có)
  useEffect(() => {
    if (!isOpen || isPaid) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    let socket: any = null;

    try {
      if (typeof (window as any).io === 'function') {
        socket = (window as any).io(socketUrl, {
          transports: ['websocket', 'polling'],
          withCredentials: true,
        });

        socket.on('payment_success', (data: any) => {
          if (data.orderId === orderId || data.orderCode === orderCode) {
            setIsPaid(true);
            setIsPolling(false);
          }
        });
      }
    } catch (err) {
      console.warn('Socket connection warning:', err);
    }

    return () => {
      if (socket && typeof socket.disconnect === 'function') socket.disconnect();
    };
  }, [isOpen, isPaid, orderId, orderCode]);

  // Auto redirect / callback when payment success
  useEffect(() => {
    if (!isPaid) return;

    const timer = setTimeout(() => {
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
      onClose();
    }, 2500);

    return () => clearTimeout(timer);
  }, [isPaid, onPaymentSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Thanh toán VietQR</h3>
              <p className="text-xs text-cyan-100 font-medium">Mã đơn: {orderCode}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[80vh] space-y-5">
          {isPaid ? (
            /* Success State */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-800">Thanh Toán Thành Công!</h4>
                <p className="text-xs text-slate-500">
                  Hệ thống đã nhận được số tiền <span className="font-bold text-emerald-600">{formattedAmount}</span>.
                </p>
              </div>
              <p className="text-xs text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 font-medium flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Đang tự động chuyển đến trang Quản lý đơn hàng...</span>
              </p>
              <button
                onClick={() => {
                  if (onPaymentSuccess) onPaymentSuccess();
                  onClose();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-colors cursor-pointer text-sm"
              >
                Xem Đơn Hàng Ngay
              </button>
            </div>
          ) : (
            /* QR Display & Instructions */
            <>
              {/* QR Image Box */}
              <div className="flex flex-col items-center justify-center bg-slate-50 p-4 rounded-2xl border border-slate-200/80 shadow-inner relative group">
                <div className="bg-white p-3 rounded-xl shadow-md border border-slate-200 relative">
                  <img
                    src={qrCodeUrl}
                    alt="Mã QR VietQR thanh toán"
                    className="w-56 h-56 object-contain rounded-lg"
                  />
                  <div className="absolute inset-x-0 bottom-1 flex items-center justify-center">
                    <span className="text-[10px] font-bold bg-cyan-600 text-white px-2.5 py-0.5 rounded-full shadow">
                      VietQR Napas 247
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-cyan-700 bg-cyan-50 px-3 py-1.5 rounded-lg border border-cyan-200">
                  {isPolling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-600" />
                      <span>Đang tự động kiểm tra số dư...</span>
                    </>
                  ) : (
                    <span>Mở app ngân hàng bất kỳ để quét QR</span>
                  )}
                </div>
              </div>

              {/* Bank Information Details */}
              <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> Ngân hàng:
                  </span>
                  <span className="font-bold text-slate-800 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                    {bankName}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-slate-400" /> Chủ tài khoản:
                  </span>
                  <span className="font-bold text-slate-800 uppercase">{accountName}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Smartphone className="w-3.5 h-3.5 text-slate-400" /> Số tài khoản:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900 text-sm">{accountNo}</span>
                    <button
                      onClick={() => handleCopy(accountNo, 'account')}
                      className="p-1 text-cyan-600 hover:bg-cyan-50 rounded transition-colors cursor-pointer"
                      title="Sao chép số tài khoản"
                    >
                      {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Số tiền:
                  </span>
                  <span className="font-bold text-emerald-600 text-sm">{formattedAmount}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <FileText className="w-3.5 h-3.5 text-slate-400" /> Nội dung CK:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-xs">
                      {transferContent}
                    </span>
                    <button
                      onClick={() => handleCopy(transferContent, 'content')}
                      className="p-1 text-cyan-600 hover:bg-cyan-50 rounded transition-colors cursor-pointer"
                      title="Sao chép nội dung chuyển khoản"
                    >
                      {copiedContent ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Note Alert */}
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-800 font-medium leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Vui lòng giữ nguyên <strong>Nội dung chuyển khoản ({transferContent})</strong> để hệ thống tự động nhận diện thanh toán ngay lập tức.
                </span>
              </div>

              {/* Action buttons */}
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Tôi đã chuyển tiền / Đóng
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
