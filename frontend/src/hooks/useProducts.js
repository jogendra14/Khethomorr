// frontend/src/hooks/useProducts.js
import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from "../api/productApi";
import { toast } from "react-hot-toast"; // Optional: agar toast use karte ho

// ✅ INFINITE QUERY HOOK (For Shop/Listing)
export const useProducts = (filters = {}) => {
  return useInfiniteQuery({
    queryKey: ["products", filters],
    
    queryFn: ({ pageParam = 1 }) => {
      return getAllProducts({
        page: pageParam,
        limit: 20,
        ...filters,
      });
    },
    
    initialPageParam: 1,
    
    getNextPageParam: (lastPage) => {
      return lastPage.pagination?.hasNextPage 
        ? lastPage.pagination.page + 1 
        : undefined;
    },
    
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (cacheTime renamed in v5)
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// ✅ SINGLE PRODUCT QUERY HOOK
export const useProduct = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id, // Only run if id exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

// ============================================
// ✅ ADD PRODUCT MUTATION
// ============================================
export const useAddProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => createProduct(formData),
    
    onSuccess: (data) => {
      // Invalidate products cache to refetch
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added successfully! ✅");
      return data;
    },
    
    onError: (error) => {
      console.error("Add product error:", error);
      toast.error(error?.response?.data?.message || "Failed to add product ❌");
    },
  });
};

// ============================================
// ✅ UPDATE PRODUCT MUTATION
// ============================================
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    
    onSuccess: (data, variables) => {
      // Update specific product cache
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
      // Update products list
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product updated successfully! ✅");
      return data;
    },
    
    onError: (error) => {
      console.error("Update product error:", error);
      toast.error(error?.response?.data?.message || "Failed to update product ❌");
    },
  });
};

// ============================================
// ✅ DELETE PRODUCT MUTATION
// ============================================
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteProduct(id),
    
    onSuccess: (data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["product", id] });
      // Update products list
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deleted successfully! 🗑️");
      return data;
    },
    
    onError: (error) => {
      console.error("Delete product error:", error);
      toast.error(error?.response?.data?.message || "Failed to delete product ❌");
    },
  });
};
