/**
 * serviceService.ts — Service xử lý Gói dịch vụ giặt ủi
 *
 * Map tới backend routes: /api/services
 *
 * Các hàm:
 *  - getAllServices()          → GET    /services        (public)
 *  - getServiceById(id)        → GET    /services/:id    (public)
 *  - createService(payload)    → POST   /services        (admin only)
 *  - updateService(id, data)   → PUT    /services/:id    (admin only)
 *  - deleteService(id)         → DELETE /services/:id    (admin only)
 */

import apiClient from './apiClient';

// ─── TypeScript Interfaces (map 1:1 với Service.model.js & Swagger) ───────────

/**
 * Schema đầy đủ của một gói dịch vụ giặt ủi
 */
export interface LaundryService {
  _id: string;
  name: string;            // Tên dịch vụ (unique). Vd: "Giặt + Sấy thường"
  description?: string;    // Mô tả chi tiết
  /**
   * Loại tính giá:
   * - 'per_kg':   Tính theo kg.   Vd: 25.000đ/kg
   * - 'per_item': Tính theo món.  Vd: 150.000đ/chiếc áo vest
   */
  priceType: 'per_kg' | 'per_item';
  price: number;           // Đơn giá (VNĐ). totalPrice = price × quantity
  estimatedHours: number;  // Thời gian xử lý ước tính (giờ, mặc định 24)
  isActive: boolean;       // Dịch vụ có đang được cung cấp không
  createdAt: string;
  updatedAt: string;
}

/** Payload để tạo gói dịch vụ mới */
export interface CreateServicePayload {
  name: string;
  priceType: 'per_kg' | 'per_item';
  price: number;           // Phải >= 0
  description?: string;
  estimatedHours?: number; // Mặc định 24h nếu không truyền
}

/** Payload để cập nhật gói dịch vụ (partial — chỉ truyền field cần thay đổi) */
export type UpdateServicePayload = Partial<CreateServicePayload & { isActive: boolean }>;

// ─── Response types ────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Lấy danh sách tất cả gói dịch vụ đang hoạt động.
 * ENDPOINT PUBLIC — không cần đăng nhập.
 *
 * @example
 * const services = await getAllServices();
 * // services = [{ _id: "...", name: "Giặt + Sấy thường", priceType: "per_kg", price: 25000, ... }]
 */
export const getAllServices = async (): Promise<LaundryService[]> => {
  const response = await apiClient.get<ApiResponse<{ services: LaundryService[] }>>('/services');
  return response.data.data.services;
};

/**
 * Lấy chi tiết một gói dịch vụ theo ID.
 * ENDPOINT PUBLIC — không cần đăng nhập.
 */
export const getServiceById = async (serviceId: string): Promise<LaundryService> => {
  const response = await apiClient.get<ApiResponse<{ service: LaundryService }>>(`/services/${serviceId}`);
  return response.data.data.service;
};

/**
 * [ADMIN ONLY] Tạo gói dịch vụ mới.
 * Tên dịch vụ phải là duy nhất trong hệ thống.
 *
 * @example
 * const service = await createService({
 *   name: "Giặt + Ủi phẳng",
 *   priceType: "per_kg",
 *   price: 35000,
 *   estimatedHours: 36,
 * });
 */
export const createService = async (payload: CreateServicePayload): Promise<LaundryService> => {
  const response = await apiClient.post<ApiResponse<{ service: LaundryService }>>('/services', payload);
  return response.data.data.service;
};

/**
 * [ADMIN ONLY] Cập nhật thông tin gói dịch vụ.
 * Chỉ truyền các field muốn thay đổi.
 * Dùng isActive: false để tạm ngừng cung cấp dịch vụ (thay vì xóa).
 *
 * @example
 * // Tăng giá
 * await updateService("64f1...", { price: 30000 });
 *
 * // Tạm ngừng dịch vụ
 * await updateService("64f1...", { isActive: false });
 */
export const updateService = async (
  serviceId: string,
  payload: UpdateServicePayload
): Promise<LaundryService> => {
  const response = await apiClient.put<ApiResponse<{ service: LaundryService }>>(
    `/services/${serviceId}`,
    payload
  );
  return response.data.data.service;
};

/**
 * [ADMIN ONLY] Xóa vĩnh viễn gói dịch vụ.
 *
 * ⚠️ Lưu ý: Ưu tiên dùng updateService({ isActive: false }) thay vì xóa hẳn,
 * để tránh ảnh hưởng đến lịch sử đơn hàng đã có.
 */
export const deleteService = async (serviceId: string): Promise<void> => {
  await apiClient.delete(`/services/${serviceId}`);
};
