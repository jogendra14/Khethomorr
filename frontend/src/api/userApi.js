// frontend/src/api/userApi.js
import API from "./axios.js";

const userApi = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    const response = await API.get("/api/auth/me");
    return response.data;
  },

  /**
   * Update user profile (non-password fields)
   * @param {Object} data - { name, phone, address, avatar }
   */
  updateProfile: async (data) => {
    const response = await API.put("/api/users/profile", data);
    
    // Update stored user data
    if (response.data.success && response.data.data) {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, ...response.data.data };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    
    return response.data;
  },

  /**
   * Upload avatar
   * @param {File} file - Image file
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    
    const response = await API.post("/api/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    // Update stored user data
    if (response.data.success && response.data.data?.avatar) {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, avatar: response.data.data.avatar };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
    
    return response.data;
  },

  /**
   * Get user orders
   * @param {Object} params - { page, limit, status }
   */
  getOrders: async (params = {}) => {
    const response = await API.get("/api/orders/my-orders", { params });
    return response.data;
  },

  /**
   * Get user order details
   * @param {string} orderId 
   */
  getOrderDetails: async (orderId) => {
    const response = await API.get(`/api/orders/${orderId}`);
    return response.data;
  },

  /**
   * Add to wishlist
   * @param {string} productId 
   */
  addToWishlist: async (productId) => {
    const response = await API.post("/api/users/wishlist", { productId });
    return response.data;
  },

  /**
   * Remove from wishlist
   * @param {string} productId 
   */
  removeFromWishlist: async (productId) => {
    const response = await API.delete(`/api/users/wishlist/${productId}`);
    return response.data;
  },

  /**
   * Get wishlist
   */
  getWishlist: async () => {
    const response = await API.get("/api/users/wishlist");
    return response.data;
  },

  /**
   * Get user reviews
   */
  getReviews: async () => {
    const response = await API.get("/api/users/reviews");
    return response.data;
  },

  /**
   * Delete account
   */
  deleteAccount: async () => {
    const response = await API.delete("/api/users/account");
    
    // Clear local storage on deletion
    if (response.data.success) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
    }
    
    return response.data;
  }
};


export default userApi;