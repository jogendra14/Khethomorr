// frontend/src/api/adminApi.js
import API from "./axios.js";

const adminApi = {
  /**
   * Get all users (Admin only)
   * @param {Object} params - { page, limit, search, role, status }
   */
  getUsers: async (params = {}) => {
    const response = await API.get("/users/all", { params });
    return response.data;
  },

  /**
   * Get user details (Admin only)
   * @param {string} userId 
   */
  getUserDetails: async (userId) => {
    const response = await API.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update user (Admin only)
   * @param {string} userId 
   * @param {Object} data - { name, email, role, isActive, isEmailVerified }
   */
  updateUser: async (userId, data) => {
    const response = await API.put(`/users/${userId}`, data);
    return response.data;
  },

  /**
   * Delete user (Admin only)
   * @param {string} userId 
   */
  deleteUser: async (userId) => {
    const response = await API.delete(`/users/${userId}`);
    return response.data;
  },

  /**
   * Activate/Deactivate user (Admin only)
   * @param {string} userId 
   * @param {boolean} isActive 
   */
  toggleUserStatus: async (userId, isActive) => {
    const response = await API.patch(`/users/${userId}/status`, { isActive });
    return response.data;
  },

  /**
   * Get all vendors (Admin only)
   * @param {Object} params - { page, limit, search, status }
   */
  getVendors: async (params = {}) => {
    const response = await API.get("/vendors", { params });
    return response.data;
  },

  /**
   * Get all orders (Admin only)
   * @param {Object} params - { page, limit, status, fromDate, toDate }
   */
  getAllOrders: async (params = {}) => {
    const response = await API.get("/orders", { params });
    return response.data;
  },

  /**
   * Update order status (Admin only)
   * @param {string} orderId 
   * @param {string} status 
   */
  updateOrderStatus: async (orderId, status) => {
    const response = await API.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  /**
   * Get analytics dashboard data (Admin only)
   * @param {Object} params - { period, fromDate, toDate }
   */
  getAnalytics: async (params = {}) => {
    const response = await API.get("/analytics/dashboard", { params });
    return response.data;
  },

  /**
   * Get revenue analytics (Admin only)
   * @param {Object} params - { period, fromDate, toDate }
   */
  getRevenueAnalytics: async (params = {}) => {
    const response = await API.get("/analytics/revenue", { params });
    return response.data;
  },

  /**
   * Get user analytics (Admin only)
   * @param {Object} params - { period }
   */
  getUserAnalytics: async (params = {}) => {
    const response = await API.get("/analytics/users", { params });
    return response.data;
  },

  /**
   * Get product analytics (Admin only)
   * @param {Object} params - { period, category }
   */
  getProductAnalytics: async (params = {}) => {
    const response = await API.get("/analytics/products", { params });
    return response.data;
  },

  /**
   * Get all products (Admin only)
   * @param {Object} params - { page, limit, search, category, status }
   */
  getAllProducts: async (params = {}) => {
    const response = await API.get("/admin/products", { params });
    return response.data;
  },

  /**
   * Create product (Admin/Vendor)
   * @param {FormData} formData - Product data with images
   */
  createProduct: async (formData) => {
    const response = await API.post("/admin/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Update product (Admin/Vendor)
   * @param {string} productId 
   * @param {FormData} formData - Product data with images
   */
  updateProduct: async (productId, formData) => {
    const response = await API.put(`/admin/products/${productId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Delete product (Admin/Vendor)
   * @param {string} productId 
   */
  deleteProduct: async (productId) => {
    const response = await API.delete(`/admin/products/${productId}`);
    return response.data;
  },

  /**
   * Get site settings (Admin only)
   */
  getSiteSettings: async () => {
    const response = await API.get("/admin/settings");
    return response.data;
  },

  /**
   * Update site settings (Admin only)
   * @param {Object} settings 
   */
  updateSiteSettings: async (settings) => {
    const response = await API.put("/admin/settings", settings);
    return response.data;
  },

  /**
   * Get system health (Admin only)
   */
  getSystemHealth: async () => {
    const response = await API.get("/admin/health");
    return response.data;
  }
};

export default adminApi;