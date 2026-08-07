// frontend/src/hooks/useProducts.js

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productApi";
import { toast } from "react-hot-toast";

// ✅ INFINITE QUERY HOOK (For Shop/Listing)
export const useProducts = (filters = {}, sortBy = "createdAt", sortOrder = "desc") => {
  return useInfiniteQuery({
    queryKey: ["products", filters, sortBy, sortOrder],
    
    queryFn: ({ pageParam = 1 }) => {
      return getAllProducts({
        page: pageParam,
        limit: 10,
        sortBy,
        sortOrder,
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
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

// ✅ SINGLE PRODUCT QUERY HOOK
export const useProduct = (id) => {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

// ✅ ADD PRODUCT MUTATION
export const useAddProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => createProduct(formData),
    
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["productTypes"] }); // Invalidate types if new type was added
      toast.success("Product added successfully! ✅");
      return data;
    },
    
    onError: (error) => {
      console.error("Add product error:", error);
      toast.error(error?.response?.data?.message || "Failed to add product ❌");
    },
  });
};

// ✅ UPDATE PRODUCT MUTATION
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateProduct(id, data),
    
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] });
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

// ✅ DELETE PRODUCT MUTATION
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => deleteProduct(id),
    
    onSuccess: (data, id) => {
      queryClient.removeQueries({ queryKey: ["product", id] });
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