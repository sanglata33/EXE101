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

export interface Payment {
  _id: string;
  order: string;                                // OrderId
  amount: number;                               // Số tiền (VNĐ)
  method: 'cash' | 'vnpay' | 'momo';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionId?: string | null;                // Mã giao dịch từ cổng thanh toán
  paymentUrl?: string | null;                   // URL redirect (chỉ có với vnpay/momo)
  paidAt?: string | null;                       // ISO 8601 — thời điểm thanh toán thành công
  createdAt: string;
}

export interface CreatePaymentPayload {
  orderId: string;
  method: 'cash' | 'vnpay' | 'momo';
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Tạo giao dịch thanh toán cho đơn hàng.
 *
 * @example — Thanh toán tiền mặt
 * const payment = await createPayment({ orderId: "64f1...", method: "cash" });
 * // payment.paymentUrl === null (không cần redirect)
 *
 * @example — Thanh toán VNPay
 * const payment = await createPayment({ orderId: "64f1...", method: "vnpay" });
 * if (payment.paymentUrl) {
 *   window.location.href = payment.paymentUrl; // redirect khách đến trang thanh toán
 * }
 */
export const createPayment = async (payload: CreatePaymentPayload): Promise<Payment> => {
  const response = await apiClient.post<ApiResponse<{ payment: Payment }>>(
    '/payments/create',
    payload
  );
  return response.data.data.payment;
};

/**
 * Lấy thông tin giao dịch thanh toán của một đơn hàng.
 *
 * Dùng sau khi khách hoàn tất thanh toán VNPay để kiểm tra kết quả:
 * @example
 * const payment = await getPaymentByOrder(orderId);
 * if (payment.status === 'paid') {
 *   // Thanh toán thành công
 * }
 */
export const getPaymentByOrder = async (orderId: string): Promise<Payment> => {
  const response = await apiClient.get<ApiResponse<{ payment: Payment }>>(
    `/payments/order/${orderId}`
  );
  return response.data.data.payment;
};
