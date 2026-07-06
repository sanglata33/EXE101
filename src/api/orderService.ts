/**
 * orderService.ts — Service xử lý Đơn hàng (Orders)
 *
 * Map tới backend routes: /api/orders
 *
 * Các hàm:
 *  - createOrder(payload)           → POST   /orders
 *  - getMyOrders(params)            → GET    /orders          (customer: tự lọc theo token)
 *  - getOrderById(id)               → GET    /orders/:id
 *  - cancelOrder(id, reason)        → DELETE /orders/:id?reason=...
 *  - getAllOrders(params)            → GET    /orders          (admin/staff: xem tất cả)
 *  - updateOrderStatus(id, status)  → PUT    /orders/:id/status (staff/admin)
 */

import apiClient from './apiClient';

// ─── TypeScript Interfaces (map 1:1 với Swagger schemas) ─────────────────────

/**
 * Trạng thái đơn hàng — khớp với ORDER_STATUS constants trong BE
 * Luồng hợp lệ: received → washing → drying → delivering → completed
 *               (Bất kỳ trạng thái nào cũng → cancelled, trừ completed)
 */
export type OrderStatus =
  | 'received'    // 📦 Đã nhận đơn — trạng thái khởi tạo
  | 'washing'     // 🫧 Đang giặt
  | 'drying'      // 🌬️ Đang sấy/ủi
  | 'delivering'  // 🚚 Shipper đang giao
  | 'completed'   // ✅ Hoàn thành
  | 'cancelled';  // ❌ Đã hủy

/** Màu badge tương ứng với từng trạng thái (dùng cho UI) */
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  received:   'blue',
  washing:    'cyan',
  drying:     'orange',
  delivering: 'purple',
  completed:  'green',
  cancelled:  'red',
};

/** Nhãn tiếng Việt tương ứng với từng trạng thái */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received:   '📦 Đã nhận đơn',
  washing:    '🫧 Đang giặt',
  drying:     '🌬️ Đang sấy/ủi',
  delivering: '🚚 Đang giao',
  completed:  '✅ Hoàn thành',
  cancelled:  '❌ Đã hủy',
};

/** Ghi chú nhân viên trong đơn hàng */
export interface StaffNote {
  _id?: string;
  content: string;
  createdBy?: {
    _id: string;
    name: string;
    role: 'customer' | 'staff' | 'admin';
  };
  createdAt: string;
}

/** Một bản ghi trong lịch sử thay đổi trạng thái */
export interface StatusHistoryItem {
  status: OrderStatus;
  note?: string;
  updatedBy?: {
    _id: string;
    name: string;
    role: 'customer' | 'staff' | 'admin';
  };
  timestamp: string;
}

/** Thông tin dịch vụ được populate trong đơn hàng */
export interface ServiceRef {
  _id: string;
  name: string;
  priceType: 'per_kg' | 'per_item';
  price: number;
  estimatedHours: number;
}

/** Thông tin user được populate trong đơn hàng */
export interface UserRef {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: 'customer' | 'staff' | 'admin';
}

/** Schema đầy đủ của Order — khớp với Order.model.js */
export interface Order {
  _id: string;
  orderCode: string;                     // Format: LD-YYYYMMDD-XXXX
  customer: UserRef | string;
  staff?: UserRef | string | null;       // null nếu chưa được assign
  service: ServiceRef | string;
  quantity: number;                      // kg hoặc số món tùy priceType
  totalPrice: number;                    // Tính tự động: service.price × quantity
  status: OrderStatus;
  pickupAddress: string;
  deliveryAddress: string;
  scheduledPickupTime?: string | null;   // ISO 8601
  note?: string | null;
  staffNotes: StaffNote[];
  adminNote?: string | null;
  statusHistory: StatusHistoryItem[];
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload để tạo đơn hàng mới — khớp với CreateOrderRequest trong Swagger */
export interface CreateOrderPayload {
  serviceId: string;           // ID gói dịch vụ (lấy từ GET /services)
  quantity: number;            // Số kg hoặc số món, tối thiểu 0.1
  pickupAddress: string;       // Địa chỉ lấy đồ (bắt buộc)
  deliveryAddress: string;     // Địa chỉ giao đồ (bắt buộc)
  scheduledPickupTime?: string;// ISO 8601 — thời gian lấy đồ mong muốn
  note?: string;               // Ghi chú của khách
}

/** Query params khi lấy danh sách đơn hàng */
export interface OrderQueryParams {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

/** Response wrapper chung */
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Tạo đơn hàng mới.
 * Tổng tiền được BE tính tự động: totalPrice = service.price × quantity
 * Yêu cầu người dùng đã đăng nhập (interceptor tự đính token).
 *
 * @example
 * const order = await createOrder({
 *   serviceId: "64f1a2b3...",
 *   quantity: 3.5,
 *   pickupAddress: "123 Lê Lợi, Q1",
 *   deliveryAddress: "456 Nguyễn Trãi, Q5",
 *   note: "Giặt riêng đồ tối màu"
 * });
 */
export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const response = await apiClient.post<ApiResponse<{ order: Order }>>('/orders', payload);
  return response.data.data.order;
};

/**
 * Lấy danh sách đơn hàng.
 * - Customer: tự động chỉ thấy đơn của mình (BE lọc theo JWT token)
 * - Staff/Admin: thấy tất cả đơn hàng
 * Có thể lọc theo status và phân trang.
 */
export const getMyOrders = async (params: OrderQueryParams = {}): Promise<{
  orders: Order[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> => {
  const response = await apiClient.get<ApiResponse<{ orders: Order[] }>>('/orders', { params });
  return {
    orders: response.data.data.orders,
    pagination: response.data.pagination ?? { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
};

/**
 * Lấy chi tiết một đơn hàng theo ID (kèm ảnh nhận/giao đồ).
 * Customer chỉ xem được đơn của mình, Staff/Admin xem được tất cả.
 */
export const getOrderById = async (orderId: string): Promise<{
  order: Order;
  images: Array<{
    _id: string;
    imageUrl: string;
    imageType: 'pickup' | 'delivery';
    uploadedBy: UserRef;
    createdAt: string;
  }>;
}> => {
  const response = await apiClient.get<ApiResponse<{
    order: Order;
    images: Array<{
      _id: string;
      imageUrl: string;
      imageType: 'pickup' | 'delivery';
      uploadedBy: UserRef;
      createdAt: string;
    }>;
  }>>(`/orders/${orderId}`);
  return response.data.data;
};

/**
 * Hủy đơn hàng.
 * - Customer: chỉ hủy được khi status = 'received'
 * - Admin: hủy bất kỳ lúc nào (trừ completed)
 *
 * @param reason Lý do hủy (optional, truyền qua query param)
 */
export const cancelOrder = async (orderId: string, reason?: string): Promise<Order> => {
  const response = await apiClient.delete<ApiResponse<{ order: Order }>>(
    `/orders/${orderId}`,
    { params: reason ? { reason } : undefined }
  );
  return response.data.data.order;
};

/**
 * [STAFF/ADMIN] Cập nhật trạng thái đơn hàng.
 * Luồng hợp lệ: received→washing→drying→delivering→completed (mọi trạng thái→cancelled)
 */
export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<Order> => {
  const response = await apiClient.put<ApiResponse<{ order: Order }>>(
    `/orders/${orderId}/status`,
    { status, note }
  );
  return response.data.data.order;
};

/**
 * [STAFF/ADMIN] Phân công nhân viên cho đơn hàng.
 * Chỉ Admin mới có quyền.
 */
export const assignStaff = async (orderId: string, staffId: string): Promise<Order> => {
  const response = await apiClient.put<ApiResponse<{ order: Order }>>(
    `/orders/${orderId}/assign`,
    { staffId }
  );
  return response.data.data.order;
};
