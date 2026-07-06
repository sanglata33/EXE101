/**
 * AuthContext.tsx — Global Authentication State
 *
 * Cung cấp:
 *  - Trạng thái đăng nhập (user, isAuthenticated, isLoading)
 *  - Hàm login / register / logout tích hợp với authService
 *  - Tự động khôi phục session từ localStorage khi reload trang
 *
 * Cách dùng:
 *   const { user, login, logout, isAuthenticated } = useAuth();
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { AxiosError } from 'axios';
import {
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  getStoredUser,
  isAuthenticated as checkAuth,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
} from '../api/authService';

// ─── Context Type ─────────────────────────────────────────────────────────────

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// ─── Context & Provider ───────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Khôi phục session từ localStorage đồng bộ ngay lần render đầu tiên
    const storedUser = getStoredUser();
    if (storedUser && checkAuth()) {
      return storedUser;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (payload: LoginPayload): Promise<AuthUser> => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: loggedUser } = await loginApi(payload);
      setUser(loggedUser);
      return loggedUser; // Trả về user để component dùng role redirect
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: newUser } = await registerApi(payload);
      setUser(newUser);
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setError(axiosErr.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutApi();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── Custom Hook ──────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
