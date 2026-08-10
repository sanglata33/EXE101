/**
 * paymentService.ts — Service xử lý Thanh toán (Payments)
 *
 * Map tới backend routes: /api/payments
 *
 * Các hàm:
 *  - createPayment(payload)       → POST /payments/create
 *  - getPaymentByOrder(orderId)   → GET  /payments/order/:orderId
 *
 * Luồng thanh toán VNPay:
 *  1. Gọi createPayment({ orderId, method: "vnpay" })
 *  2. Server trả về paymentUrl
 *  3. FE redirect: window.location.href = paymentUrl
 *  4. VNPay callback về BE tự động (GET /payments/vnpay-return) — FE không can thiệp
 *  5. FE poll getPaymentByOrder(orderId) để kiểm tra kết quả (status === 'paid')
 */

import apiClient from './apiClient';

// ─── TypeScript Interfaces (map 1:1 với Payment.model.js & Swagger) ───────────

export interface BankInfo {
  bankId?: string;
  accountNo?: string;
  accountName?: string;
  amount?: number;
  transferContent?: string;
}

export interface Payment {
  _id: string;
  order: string;                                // OrderId
  amount: number;                               // Số tiền (VNĐ)
  method: 'cash' | 'vnpay' | 'momo' | 'bank_transfer' | 'vietqr';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string | null;                // Mã giao dịch từ cổng thanh toán
  paymentUrl?: string | null;                   // URL redirect (chỉ có với vnpay/momo)
  qrCodeUrl?: string | null;                    // Mã QR VietQR
  bankInfo?: BankInfo | null;                   // Thông tin tài khoản thụ hưởng VietQR
  paidAt?: string | null;                       // ISO 8601 — thời điểm thanh toán thành công
  createdAt: string;
}

export interface CreatePaymentPayload {
  orderId: string;
  method: 'cash' | 'vnpay' | 'momo' | 'bank_transfer' | 'vietqr';
}

export interface CreatePaymentResponse {
  payment: Payment;
  qrCodeUrl?: string;
  bankInfo?: BankInfo;
  paymentUrl?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Tạo giao dịch thanh toán cho đơn hàng.
 */
export const createPayment = async (payload: CreatePaymentPayload): Promise<CreatePaymentResponse> => {
  const response = await apiClient.post<ApiResponse<CreatePaymentResponse>>(
    '/payments/create',
    payload
  );
  return response.data.data;
};

/**
 * Lấy thông tin giao dịch thanh toán của một đơn hàng.
 */
export const getPaymentByOrder = async (orderId: string): Promise<Payment> => {
  const response = await apiClient.get<ApiResponse<{ payment: Payment }>>(
    `/payments/order/${orderId}`
  );
  return response.data.data.payment;
};

/**
 * Staff / Admin xác nhận thanh toán chuyển khoản thủ công.
 */
export const confirmPayment = async (paymentId: string): Promise<Payment> => {
  const response = await apiClient.patch<ApiResponse<{ payment: Payment }>>(
    `/payments/${paymentId}/confirm`
  );
  return response.data.data.payment;
};
