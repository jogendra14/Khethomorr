import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api';
import { toast } from 'react-hot-toast';

// ========== QUERY KEYS ==========
export const cartKeys = {
  all: ['cart'],
  cart: () => [...cartKeys.all, 'details'],
  summary: () => [...cartKeys.all, 'summary'],
};

// ========== HOOKS ==========

// Get cart
export const useCart = () => {
  return useQuery({
    queryKey: cartKeys.cart(),
    queryFn: () => cartApi.getCart().then(res => res.data.data),
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Get cart summary
export const useCartSummary = () => {
  return useQuery({
    queryKey: cartKeys.summary(),
    queryFn: () => cartApi.getSummary().then(res => res.data.data),
    staleTime: 30 * 1000,
  });
};

// Add to cart
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => cartApi.addToCart(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(cartKeys.all);
      toast.success('Added to cart!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    },
  });
};

// Update cart item
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }) =>
      cartApi.updateItem(itemId, quantity).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(cartKeys.all);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update cart');
    },
  });
};

// Remove from cart
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId) => cartApi.removeItem(itemId).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(cartKeys.all);
      toast.success('Removed from cart');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove item');
    },
  });
};

// Clear cart
export const useClearCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.clearCart().then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(cartKeys.all);
      toast.success('Cart cleared');
    },
  });
};

// Apply coupon
export const useApplyCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code) => cartApi.applyCoupon(code).then(res => res.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(cartKeys.all);
      toast.success(data.message || 'Coupon applied!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Invalid coupon');
    },
  });
};

// Remove coupon
export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => cartApi.removeCoupon().then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(cartKeys.all);
      toast.success('Coupon removed');
    },
  });
};