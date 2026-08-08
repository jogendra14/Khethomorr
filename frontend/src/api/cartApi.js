// frontend/src/api/cartApi.js
import API from "./axios";

const CartAPI = {
  // Get cart
  getCart: async () => {
    const response = await API.get("/cart");
    return response.data;
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1, variantId = null) => {
    const response = await API.post("/cart/add", {
      productId,
      quantity,
      variantId
    });
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    const response = await API.put("/cart/update", {
      productId,
      quantity
    });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    const response = await API.delete(`/cart/remove/${productId}`);
    return response.data;
  },

  // Clear cart
  clearCart: async () => {
    const response = await API.delete("/cart/clear");
    return response.data;
  },

  // Apply coupon
  applyCoupon: async (couponCode) => {
    const response = await API.post("/cart/apply-coupon", { couponCode });
    return response.data;
  },

  // Remove coupon
  removeCoupon: async () => {
    const response = await API.delete("/cart/remove-coupon");
    return response.data;
  },
};

export default CartAPI;