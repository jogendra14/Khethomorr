import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../api';
import { toast } from 'react-hot-toast';

// ========== QUERY KEYS ==========
export const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (filters) => [...orderKeys.lists(), filters],
  myOrders: () => [...orderKeys.all, 'my-orders'],
  detail: (id) => [...orderKeys.all, 'detail', id],
  stats: () => [...orderKeys.all, 'stats'],
};

// ========== USER HOOKS ==========

// Get my orders
export const useMyOrders = (params = {}) => {
  return useQuery({
    queryKey: [...orderKeys.myOrders(), params],
    queryFn: () => orderApi.getMyOrders(params).then(res => res.data),
  });
};

// Get single order
export const useOrder = (id) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderApi.getOrderById(id).then(res => res.data.data),
    enabled: !!id,
  });
};

// Create order
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => orderApi.createOrder(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(orderKeys.myOrders());
      queryClient.invalidateQueries(['cart']);
      toast.success('Order placed successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    },
  });
};

// Cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }) => orderApi.cancelOrder(id, reason).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(orderKeys.detail(variables.id));
      queryClient.invalidateQueries(orderKeys.myOrders());
      toast.success('Order cancelled');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    },
  });
};

// ========== ADMIN HOOKS ==========

// Get all orders
export const useAllOrders = (params = {}) => {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => orderApi.getAllOrders(params).then(res => res.data),
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, note }) =>
      orderApi.updateStatus(id, status, note).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(orderKeys.detail(variables.id));
      queryClient.invalidateQueries(orderKeys.lists());
      toast.success('Order status updated!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};

// Add tracking
export const useAddTracking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => orderApi.addTracking(id, data).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(orderKeys.detail(variables.id));
      toast.success('Tracking added!');
    },
  });
};