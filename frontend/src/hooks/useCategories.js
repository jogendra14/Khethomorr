import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api';
import { toast } from 'react-hot-toast';

// ========== QUERY KEYS ==========
export const categoryKeys = {
  all: ['categories'],
  lists: () => [...categoryKeys.all, 'list'],
  list: (filters) => [...categoryKeys.lists(), filters],
  detail: (id) => [...categoryKeys.all, 'detail', id],
  featured: () => [...categoryKeys.all, 'featured'],
};

// ========== PUBLIC HOOKS ==========

// Get all categories
export const useCategories = (params = {}) => {
  return useQuery({
    queryKey: categoryKeys.list(params),
    queryFn: () => categoryApi.getCategories(params).then(res => res.data),
  });
};

// Get featured categories
export const useFeaturedCategories = (limit = 6) => {
  return useQuery({
    queryKey: categoryKeys.featured(),
    queryFn: () => categoryApi.getFeatured(limit).then(res => res.data),
  });
};

// Get single category
export const useCategory = (id) => {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoryApi.getById(id).then(res => res.data.data),
    enabled: !!id,
  });
};

// ========== ADMIN HOOKS ==========

// Create category
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => categoryApi.create(data).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(categoryKeys.lists());
      toast.success('Category created!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create category');
    },
  });
};

// Update category
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => categoryApi.update(id, data).then(res => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(categoryKeys.detail(variables.id));
      queryClient.invalidateQueries(categoryKeys.lists());
      toast.success('Category updated!');
    },
  });
};

// Delete category
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoryApi.delete(id, true).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(categoryKeys.lists());
      toast.success('Category deleted!');
    },
  });
};

// Toggle category status
export const useToggleCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => categoryApi.toggleStatus(id).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(categoryKeys.lists());
      toast.success('Status updated!');
    },
  });
};