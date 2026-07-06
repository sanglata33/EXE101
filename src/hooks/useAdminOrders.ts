import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../api/adminService';
import type { Order, OrderStatus } from '../api/adminService';

export const useAdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);
  const [total, setTotal] = useState<number>(0);
  
  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [searchText, setSearchText] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllOrders({
        status: statusFilter,
        search: searchText || undefined,
        page: currentPage,
        limit: pageSize,
      });
      setOrders(res.orders);
      setTotal(res.total);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      alert('Lỗi: Không thể lấy danh sách đơn hàng!');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchText, currentPage]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdating(true);
      await adminService.updateOrderStatus(orderId, newStatus);
      // alert('Cập nhật trạng thái thành công!');
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('Lỗi: Cập nhật trạng thái thất bại!');
    } finally {
      setUpdating(false);
    }
  };

  return {
    orders,
    loading,
    updating,
    total,
    currentPage,
    pageSize,
    statusFilter,
    searchText,
    setCurrentPage,
    setStatusFilter,
    setSearchText,
    handleUpdateStatus,
    refetch: fetchOrders,
  };
};
