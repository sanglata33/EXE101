import apiClient from './apiClient';

/**
 * OrderStatus — khớp với ORDER_STATUS constants trong BE (constants/orderStatus.js)
 * Luồng: received → washing → drying → delivering → completed (mọi trạng thái → cancelled)
 */
export type OrderStatus =
  | 'received'    // 📦 Đã nhận đơn
  | 'washing'     // 🫧 Đang giặt
  | 'drying'      // 🌬️ Đang sấy/ủi
  | 'delivering'  // 🚚 Đang giao
  | 'completed'   // ✅ Hoàn thành
  | 'cancelled';  // ❌ Đã hủy

export interface Order {
  _id: string;
  orderCode: string;
  customer?: {
    _id: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    createdAt?: string;
  };
  totalAmount: number;
  totalPrice?: number; // Backend schema uses totalPrice
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface Staff {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  updatedBy?: {
    _id: string;
    name: string;
    role: string;
  };
  updatedAt: string;
  note?: string;
}

export interface StaffNoteItem {
  _id?: string;
  content: string;
  createdBy?: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

export interface OrderDetail extends Order {
  statusHistory?: StatusHistoryItem[];
  staffNotes?: StaffNoteItem[];
  adminNote?: string;
  staff?: Staff;
  service?: {
    _id: string;
    name: string;
    description?: string;
    priceType: 'per_kg' | 'per_item';  // khớp với Service.model.js
    price: number;
    estimatedHours?: number;
  };
}

export interface OrderImage {
  _id: string;
  order: string;
  imageUrl: string;          // khớp với OrderImage.model.js (field là imageUrl, không phải url)
  imageType: 'pickup' | 'delivery';
  uploadedBy?: {
    _id: string;
    name: string;
    role: string;
  };
  metadata?: {
    originalName: string;
    mimetype: string;
    size: number;
  };
  createdAt: string;
}

export interface OrderDetailResponse {
  order: OrderDetail;
  images: OrderImage[];
}

export interface DashboardOverview {
  todayOrders: number;
  activeOrders: number;
  activeStaffCount: number;
}

export interface DashboardRevenue {
  thisMonth: number;
  lastMonth: number;
  changePercent: number;
  thisMonthCompletedCount: number;
}

export interface DashboardStatusCount {
  status: OrderStatus;
  label: string;
  count: number;
}

export interface DashboardTopService {
  name: string;
  orderCount: number;
  revenue: number;
}

export interface DashboardStats {
  overview: DashboardOverview;
  revenue: DashboardRevenue;
  ordersByStatus: DashboardStatusCount[];
  topServices: DashboardTopService[];
  recentOrders: Order[];
}

export interface GetAllOrdersParams {
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetAllOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  };
}

export const adminService = {
  /**
   * Lấy danh sách tất cả đơn hàng (Dành cho Admin/Staff)
   */
  getAllOrders: async (params?: GetAllOrdersParams): Promise<GetAllOrdersResponse['data']> => {
    if (localStorage.getItem('freshwash_token') === 'mock-admin-token-xyz123') {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockOrders: Order[] = [
        { _id: '1', orderCode: 'LD-20240620-0001', customer: { _id: 'c1', name: 'Nguyễn Văn A', phone: '0901234567' }, totalAmount: 87500, totalPrice: 87500, status: 'received', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { _id: '2', orderCode: 'LD-20240619-0003', customer: { _id: 'c2', name: 'Trần Thị B', phone: '0912345678' }, totalAmount: 250000, totalPrice: 250000, status: 'washing', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString() },
        { _id: '3', orderCode: 'LD-20240618-0007', customer: { _id: 'c3', name: 'Lê Văn C', phone: '0923456789' }, totalAmount: 85000, totalPrice: 85000, status: 'completed', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date().toISOString() },
      ];
      return {
        orders: mockOrders.filter(o => !params?.status || o.status === params.status),
        total: mockOrders.length,
        page: params?.page || 1,
        limit: params?.limit || 10
      };
    }

    const response = await apiClient.get<GetAllOrdersResponse>('/admin/orders', { params });
    return response.data.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng (Dành cho Admin/Staff)
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus, note?: string): Promise<Order> => {
    if (localStorage.getItem('freshwash_token') === 'mock-admin-token-xyz123') {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { _id: orderId, status } as Order;
    }

    // Admin route dùng PATCH (không phải PUT) — khớp với admin.routes.js
    const response = await apiClient.patch<{ success: boolean; data: { order: Order } }>(`/admin/orders/${orderId}/status`, { status, note });
    return response.data.data.order;
  },

  /**
   * Lấy thống kê dashboard
   */
  getDashboardStats: async (): Promise<DashboardStats> => {
    if (localStorage.getItem('freshwash_token') === 'mock-admin-token-xyz123') {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        overview: { todayOrders: 3, activeOrders: 2, activeStaffCount: 4 },
        revenue: { thisMonth: 1250000, lastMonth: 950000, changePercent: 31, thisMonthCompletedCount: 8 },
        ordersByStatus: [
          { status: 'received',   label: '📦 Đã nhận đơn',  count: 1 },
          { status: 'washing',    label: '🫧 Đang giặt',    count: 2 },
          { status: 'drying',     label: '🌬️ Đang sấy/ủi', count: 1 },
          { status: 'delivering', label: '🚚 Đang giao',    count: 0 },
          { status: 'completed',  label: '✅ Hoàn thành',   count: 8 },
          { status: 'cancelled',  label: '❌ Đã hủy',       count: 0 }
        ],
        topServices: [
          { name: 'Giặt + Sấy thường', orderCount: 15, revenue: 375000 },
          { name: 'Giặt khô cao cấp',  orderCount: 8,  revenue: 1200000 },
          { name: 'Giặt + Ủi phẳng',   orderCount: 4,  revenue: 140000 }
        ],
        recentOrders: [
          { _id: '1', orderCode: 'LD-20240620-0001', customer: { _id: 'c1', name: 'Nguyễn Văn A' }, totalAmount: 87500, totalPrice: 87500, status: 'received', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ]
      };
    }

    const response = await apiClient.get<{ success: boolean; data: DashboardStats }>('/admin/dashboard');
    return response.data.data;
  },

  /**
   * Lấy chi tiết đơn hàng
   */
  getOrderDetail: async (orderId: string): Promise<OrderDetailResponse> => {
    if (localStorage.getItem('freshwash_token') === 'mock-admin-token-xyz123') {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        order: {
          _id: orderId,
          orderCode: 'LD-20240620-0001',
          customer: { _id: 'c1', name: 'Nguyễn Văn A', phone: '0901234567', email: 'vana@gmail.com', address: '123 Đường số 4, Q.7, TP.HCM', createdAt: '2026-01-01T00:00:00Z' },
          totalAmount: 87500,
          totalPrice: 87500,
          status: 'received',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          service: { _id: 's1', name: 'Giặt + Sấy thường', description: 'Giặt máy kết hợp sấy khô', priceType: 'per_kg', price: 25000, estimatedHours: 24 },
          staff: { _id: 'st1', name: 'Trần Nhân Viên', email: 'nv1@freshwash.com', role: 'staff', isActive: true },
          statusHistory: [
            { status: 'received', updatedAt: new Date().toISOString(), note: 'Đơn hàng mới được tạo', updatedBy: { _id: 'c1', name: 'Nguyễn Văn A', role: 'customer' } }
          ],
          staffNotes: [
            { content: 'Quần áo sáng màu cần tách riêng', createdBy: { _id: 'st1', name: 'Trần Nhân Viên', role: 'staff' }, createdAt: new Date().toISOString() }
          ],
          adminNote: 'Khách hàng thân thiết'
        },
        images: []
      };
    }

    const response = await apiClient.get<{ success: boolean; data: OrderDetailResponse }>(`/admin/orders/${orderId}`);
    return response.data.data;
  },

  /**
   * Thêm ghi chú nhân viên
   */
  addStaffNote: async (orderId: string, content: string): Promise<StaffNoteItem[]> => {
    if (localStorage.getItem('freshwash_token') === 'mock-admin-token-xyz123') {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [{ content, createdBy: { _id: 'mock', name: 'Mock User', role: 'staff' }, createdAt: new Date().toISOString() }];
    }

    const response = await apiClient.post<{ success: boolean; data: { staffNotes: StaffNoteItem[] } }>(`/admin/orders/${orderId}/staff-notes`, { content });
    return response.data.data.staffNotes;
  },

  /**
   * Cập nhật ghi chú admin (Admin only)
   */
  updateAdminNote: async (orderId: string, adminNote: string): Promise<string> => {
    if (localStorage.getItem('freshwash_token') === 'mock-admin-token-xyz123') {
      await new Promise(resolve => setTimeout(resolve, 300));
      return adminNote;
    }

    const response = await apiClient.put<{ success: boolean; data: { adminNote: string } }>(`/admin/orders/${orderId}/admin-note`, { adminNote });
    return response.data.data.adminNote;
  },

  /**
   * Lấy danh sách nhân viên để phân công
   */
  getStaffList: async (search?: string): Promise<Staff[]> => {
    if (localStorage.getItem('freshwash_token') === 'mock-admin-token-xyz123') {
      await new Promise(resolve => setTimeout(resolve, 300));
      return [
        { _id: 'st1', name: 'Trần Nhân Viên 1', email: 'nv1@freshwash.com', role: 'staff', isActive: true },
        { _id: 'st2', name: 'Lê Nhân Viên 2', email: 'nv2@freshwash.com', role: 'staff', isActive: true }
      ];
    }

    const response = await apiClient.get<{ success: boolean; data: { staff: Staff[] } }>('/admin/staff', { params: { search } });
    return response.data.data.staff;
  },

  /**
   * Phân công nhân viên cho đơn hàng (Admin only)
   */
  assignStaff: async (orderId: string, staffId: string): Promise<OrderDetail> => {
    if (localStorage.getItem('freshwash_token') === 'mock-admin-token-xyz123') {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { _id: orderId, staff: { _id: staffId, name: 'Assigned Staff', email: '', role: 'staff', isActive: true } } as OrderDetail;
    }

    const response = await apiClient.put<{ success: boolean; data: { order: OrderDetail } }>(`/admin/orders/${orderId}/assign`, { staffId });
    return response.data.data.order;
  },

  // ─── Quản lý tài khoản (Admin only) ────────────────────────────────────────

  /**
   * Lấy danh sách tất cả người dùng từ database.
   * Query: ?role=customer|staff|admin&search=...&page=1&limit=20
   */
  getAllUsers: async (params?: {
    role?: 'customer' | 'staff' | 'admin';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: AppUser[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await apiClient.get<{
      success: boolean;
      data: { users: AppUser[] };
      // BE dùng ApiResponse.success() → lưu pagination vào key 'meta'
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>('/admin/users', { params });
    return {
      users: response.data.data.users,
      ...(response.data.meta ?? { total: 0, page: 1, limit: 15, totalPages: 0 }),
    };
  },


  /**
   * Cập nhật vai trò người dùng (cấp/thu hồi quyền).
   * Không thể tự thay đổi quyền của chính mình.
   */
  updateUserRole: async (userId: string, role: 'customer' | 'staff' | 'admin'): Promise<AppUser> => {
    const response = await apiClient.patch<{ success: boolean; data: { user: AppUser } }>(
      `/admin/users/${userId}/role`,
      { role }
    );
    return response.data.data.user;
  },

  /**
   * Khóa hoặc mở khóa tài khoản.
   * isActive: false → khóa tài khoản (user không thể đăng nhập)
   * isActive: true  → mở khóa tài khoản
   */
  updateUserStatus: async (userId: string, isActive: boolean): Promise<AppUser> => {
    const response = await apiClient.patch<{ success: boolean; data: { user: AppUser } }>(
      `/admin/users/${userId}/status`,
      { isActive }
    );
    return response.data.data.user;
  },
};

// ─── User type (dùng cho quản lý tài khoản) ──────────────────────────────────
export interface AppUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role: 'customer' | 'staff' | 'admin';
  isActive: boolean;
  isPhoneVerified?: boolean;
  createdAt: string;
}
