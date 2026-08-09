import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { productApi } from '../api';
import { toast } from 'react-hot-toast';

// ========== QUERY KEYS ==========
export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), filters],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
  featured: () => [...productKeys.all, 'featured'],
  bestSelling: () => [...productKeys.all, 'best-selling'],
  newArrivals: () => [...productKeys.all, 'new-arrivals'],
  search: (query) => [...productKeys.all, 'search', query],
  byCategory: (categoryId) => [...productKeys.all, 'category', categoryId],
  stats: () => [...productKeys.all, 'stats'],
  lowStock: () => [...productKeys.all, 'low-stock'],
};

// ========== HOOKS ==========

// Get all products (with filters)
export const useProducts = (params = {}) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productApi.getProducts(params).then(res => res.data),
    keepPreviousData: true, // Smooth pagination
  });
};

// Get single product
export const useProduct = (id) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productApi.getProductById(id).then(res => res.data.data),
    enabled: !!id,
  });
};

// Get product by slug
export const useProductBySlug = (slug) => {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => productApi.getProductBySlug(slug).then(res => res.data.data),
    enabled: !!slug,
  });
};

// Get featured products
export const useFeaturedProducts = (limit = 8) => {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => productApi.getFeatured(limit).then(res => res.data),
  });
};

// Get best selling products
export const useBestSellingProducts = (limit = 10) => {
  return useQuery({
    queryKey: productKeys.bestSelling(),
    queryFn: () => productApi.getBestSelling(limit).then(res => res.data),
  });
};

// Get new arrivals
export const useNewArrivals = (days = 30, limit = 10) => {
  return useQuery({
    queryKey: productKeys.newArrivals(),
    queryFn: () => productApi.getNewArrivals(days, limit).then(res => res.data),
  });
};

// Search products
export const useSearchProducts = (query, params = {}) => {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => productApi.searchProducts(query, params).then(res => res.data),
    enabled: !!query && query.length >= 2,
    staleTime: 60 * 1000, // 1 minute for search
  });
};

// Get products by category
export const useProductsByCategory = (categoryId, params = {}) => {
  return useQuery({
    queryKey: productKeys.byCategory(categoryId),
    queryFn: () => productApi.getProductsByCategory(categoryId, params).then(res => res.data),
    enabled: !!categoryId,
  });
};

// Get related products
export const useRelatedProducts = (id) => {
  return useQuery({
    queryKey: [...productKeys.detail(id), 'related'],
    queryFn: () => productApi.getRelatedProducts(id).then(res => res.data),
    enabled: !!id,
  });
};

// ========== ADMIN HOOKS ==========

// Create product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => productApi.createProduct(formData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(productKeys.lists());
      toast.success('Product created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });
};

// Update product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }) => productApi.updateProduct(id, formData).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(productKeys.detail(variables.id));
      queryClient.invalidateQueries(productKeys.lists());
      toast.success('Product updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });
};

// Delete product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => productApi.deleteProduct(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(productKeys.lists());
      toast.success('Product deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete product');
    },
  });
};

// Update stock
export const useUpdateStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => productApi.updateStock(id, data).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(productKeys.detail(variables.id));
      queryClient.invalidateQueries(productKeys.lowStock());
      toast.success('Stock updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    },
  });
};

// Toggle featured
export const useToggleFeatured = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => productApi.toggleFeatured(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(productKeys.lists());
      queryClient.invalidateQueries(productKeys.featured());
      toast.success('Featured status updated!');
    },
  });
};

// Get product stats
export const useProductStats = () => {
  return useQuery({
    queryKey: productKeys.stats(),
    queryFn: () => productApi.getStats().then(res => res.data),
  });
};

// Get low stock products
export const useLowStockProducts = () => {
  return useQuery({
    queryKey: productKeys.lowStock(),
    queryFn: () => productApi.getLowStock().then(res => res.data),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};