/**
 * index.ts — Barrel export cho toàn bộ API layer
 *
 * Dùng file này để import gọn hơn:
 *   import { login, createOrder } from '@/api';
 * Thay vì:
 *   import { login } from '@/api/authService';
 *   import { createOrder } from '@/api/orderService';
 */

export { default as apiClient } from './apiClient';
export * from './authService';
export * from './orderService';
export * from './serviceService';
export * from './paymentService';
export * from './adminService';
