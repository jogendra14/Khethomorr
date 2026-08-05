// frontend/src/hooks/useCart.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import API from "../api/axios";

// API functions (aapko implement karni hongi)
const getCart = async () => {
  const response = await API.get("/cart");
  return response.data;
};

const addToCart = async (productId, quantity) => {
  const response = await API.post("/cart", { productId, quantity });
  return response.data;
};

const removeFromCart = async (productId) => {
  const response = await API.delete(`/cart/${productId}`);
  return response.data;
};

const updateCartItem = async ({ productId, quantity }) => {
  const response = await API.put(`/cart/${productId}`, { quantity });
  return response.data;
};

// ============================================
// ✅ GET CART
// ============================================
export const useCart = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
};

// ============================================
// ✅ ADD TO CART
// ============================================
export const useAddToCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }) => addToCart(productId, quantity),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart! 🛒");
    },
    
    onError: (error) => {
      toast.error("Failed to add to cart ❌");
      console.error(error);
    },
  });
};

// ============================================
// ✅ REMOVE FROM CART
// ============================================
export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromCart,
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
    
    onError: (error) => {
      toast.error("Failed to remove from cart ❌");
      console.error(error);
    },
  });
};

// ============================================
// ✅ UPDATE CART ITEM
// ============================================
export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCartItem,
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
    
    onError: (error) => {
      toast.error("Failed to update cart ❌");
      console.error(error);
    },
  });
};