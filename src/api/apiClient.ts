/**
 * apiClient.ts — Axios Instance trung tâm cho FreshWash
 *
 * Cấu hình:
 *  - baseURL lấy từ biến môi trường VITE_API_BASE_URL
 *  - Request interceptor: tự động đính token JWT vào header Authorization
 *  - Response interceptor: xử lý lỗi 401 (token hết hạn → logout), lỗi mạng
 */

import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

// ─── Hằng số lưu trữ key trong localStorage ──────────────────────────────────
export const TOKEN_KEY = 'freshwash_token';
export const USER_KEY  = 'freshwash_user';

// ─── Tạo Axios Instance ───────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Gửi cookie HttpOnly (Refresh Token) kèm theo request
});

// ─── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
/**
 * Tự động đính kèm Access Token vào header Authorization
 * cho mọi request nếu người dùng đã đăng nhập.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ─── RESPONSE INTERCEPTOR ────────────────────────────────────────────────────
/**
 * Xử lý tập trung các lỗi từ server:
 *  - 401 Unauthorized: Token hết hạn → xóa storage, redirect về /login
 *  - 403 Forbidden: Không đủ quyền
 *  - 5xx: Lỗi phía server
 *  - Network Error: Mất kết nối
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Trả về trực tiếp phần data của response để các service dùng ngắn gọn hơn
    return response;
  },
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Token hết hạn hoặc không hợp lệ → đăng xuất
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        // Redirect về trang login (không dùng react-router vì đây là module độc lập)
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      if (status === 403) {
        console.warn('[API] Bạn không có quyền thực hiện hành động này.');
      }

      if (status >= 500) {
        console.error('[API] Lỗi server:', error.response.data?.message);
      }
    } else if (error.request) {
      // Request đã gửi nhưng không nhận được response (mất mạng, server tắt...)
      console.error('[API] Không thể kết nối tới server. Kiểm tra kết nối mạng.');
    }

    // Luôn reject để các service/component có thể bắt lỗi bằng try/catch
    return Promise.reject(error);
  }
);

export default apiClient;
