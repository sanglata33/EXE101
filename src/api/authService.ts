/**
 * authService.ts — Service xử lý Authentication & Authorization
 *
 * Hỗ trợ 2 luồng đăng nhập:
 *  1. Email + Password: register() → login()
 *  2. SĐT + OTP: sendOtp() → verifyOtp()
 *
 * Map tới backend routes: /api/auth
 *  - POST /auth/register       → register()
 *  - POST /auth/login          → login()
 *  - POST /auth/send-otp       → sendOtp()
 *  - POST /auth/verify-otp     → verifyOtp()
 *  - POST /auth/refresh-token  → refreshToken()
 *  - POST /auth/logout         → logout()
 *  - GET  /auth/me             → getProfile()
 *  - PUT  /auth/me             → updateProfile()
 */

import apiClient, { TOKEN_KEY, USER_KEY } from './apiClient';

// ─── TypeScript Interfaces (map 1:1 với Swagger schemas) ─────────────────────

export interface AuthUser {
  _id: string;
  name: string;
  email?: string;        // Optional: chỉ có với luồng email+password
  phone?: string;        // Optional: chỉ có với luồng OTP
  address?: string;
  role: 'customer' | 'staff' | 'admin';
  isActive: boolean;
  isPhoneVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

export interface SendOtpPayload {
  phone: string;         // SĐT VN (10 số, bắt đầu bằng 0)
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;           // 6 chữ số
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
}

// ─── Response types (map 1:1 với Swagger) ────────────────────────────────────

interface AuthLoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: AuthUser;
  };
}

interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    user: AuthUser;
    isNewUser: boolean;   // true nếu đây là lần đăng ký đầu tiên
  };
}

interface GetMeResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
  };
}

// ─── Helper: Lưu token và user vào localStorage ───────────────────────────────
const saveAuthData = (token: string, user: AuthUser): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// ─── Service Functions ────────────────────────────────────────────────────────

/**
 * Đăng nhập bằng email & password (dành cho Admin và Staff).
 * Tự động lưu accessToken vào localStorage.
 * Refresh Token được BE set vào HttpOnly Cookie (browser tự quản lý).
 */
export const login = async (payload: LoginPayload): Promise<{ accessToken: string; user: AuthUser }> => {
  const response = await apiClient.post<AuthLoginResponse>('/auth/login', payload);
  const { accessToken, user } = response.data.data;
  saveAuthData(accessToken, user);
  return { accessToken, user };
};

/**
 * Đăng ký tài khoản mới bằng email & password.
 * BE tự động đăng nhập sau khi đăng ký — trả về accessToken ngay.
 * Role mặc định: customer.
 */
export const register = async (payload: RegisterPayload): Promise<{ accessToken: string; user: AuthUser }> => {
  const response = await apiClient.post<AuthLoginResponse>('/auth/register', payload);
  const { accessToken, user } = response.data.data;
  saveAuthData(accessToken, user);
  return { accessToken, user };
};

// ─── OTP Authentication (Luồng dành cho Customer) ────────────────────────────

/**
 * Bước 1 — Gửi mã OTP tới số điện thoại.
 * Rate limit: 5 lần/15 phút/IP.
 * OTP hết hạn sau 5 phút.
 *
 * @returns expiresInMinutes — số phút OTP còn hiệu lực
 */
export const sendOtp = async (phone: string): Promise<{ expiresInMinutes: number }> => {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: { expiresInMinutes: number };
  }>('/auth/send-otp', { phone } satisfies SendOtpPayload);
  return response.data.data;
};

/**
 * Bước 2 — Xác thực mã OTP và lấy JWT Token.
 * - Nếu SĐT chưa tồn tại: tự động tạo tài khoản mới (isNewUser = true)
 * - Nếu SĐT đã tồn tại: đăng nhập bình thường (isNewUser = false)
 * Tự động lưu accessToken vào localStorage.
 */
export const verifyOtp = async (
  phone: string,
  otp: string
): Promise<{ accessToken: string; user: AuthUser; isNewUser: boolean }> => {
  const response = await apiClient.post<VerifyOtpResponse>(
    '/auth/verify-otp',
    { phone, otp } satisfies VerifyOtpPayload
  );
  const { accessToken, user, isNewUser } = response.data.data;
  saveAuthData(accessToken, user);
  return { accessToken, user, isNewUser };
};

// ─── Token Management ─────────────────────────────────────────────────────────

/**
 * Cấp lại Access Token khi token cũ hết hạn (sau ~30 phút).
 * Refresh Token trong HttpOnly Cookie được browser tự gửi kèm.
 * Gọi endpoint này khi nhận 401 từ server.
 */
export const refreshToken = async (): Promise<{ accessToken: string; user: AuthUser }> => {
  const response = await apiClient.post<AuthLoginResponse>('/auth/refresh-token');
  const { accessToken, user } = response.data.data;
  saveAuthData(accessToken, user);
  return { accessToken, user };
};

/**
 * Đăng xuất: server xóa Refresh Token cookie, FE xóa localStorage.
 * Luôn xóa storage dù server có lỗi.
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.post('/auth/logout');
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

// ─── User Profile ─────────────────────────────────────────────────────────────

/**
 * Lấy thông tin đầy đủ của người dùng đang đăng nhập.
 * Route: GET /auth/me (không phải /users/profile)
 */
export const getProfile = async (): Promise<AuthUser> => {
  const response = await apiClient.get<GetMeResponse>('/auth/me');
  return response.data.data.user;
};

/**
 * Cập nhật thông tin cá nhân (tên, SĐT, địa chỉ).
 * Chỉ cần truyền các field muốn thay đổi.
 */
export const updateProfile = async (payload: UpdateProfilePayload): Promise<AuthUser> => {
  const response = await apiClient.put<GetMeResponse>('/auth/me', payload);
  const user = response.data.data.user;
  // Cập nhật user trong localStorage
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

// ─── Local Storage Helpers ────────────────────────────────────────────────────

/**
 * Lấy user từ localStorage (không cần gọi API).
 * Dùng để khởi tạo state khi load app.
 */
export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as AuthUser) : null;
};

/**
 * Kiểm tra xem người dùng đã đăng nhập chưa (có token không).
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(TOKEN_KEY);
};
