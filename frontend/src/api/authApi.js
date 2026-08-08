// frontend/src/api/authApi.js
import API from "./axios.js";

const authApi = {
  /**
   * Register new user
   */
  register: async (userData) => {
    const response = await API.post("/auth/register", userData);
    return response.data;
  },

  /**
   * Login user (Regular user)
   */
  login: async (credentials) => {
    const response = await API.post("/auth/login", credentials);
    
    // Store tokens and user data
    if (response.data.success) {
      const { token, refreshToken, user } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    return response.data;
  },

  /**
   * Admin Login - Separate endpoint for admin
   */
  adminLogin: async (credentials) => {
    // Using the same login endpoint but with role validation
    const response = await API.post("/auth/login", credentials);
    console.log("ye resonse hai ", response)

    if (response.data.success) {
      const { token, refreshToken, user } = response.data.data;
      
      // Check if user has admin role
      if (user.role !== 'admin' && user.role !== 'superadmin') {
        throw new Error("Access Denied. Admin only.");
      }
      
      // Store tokens
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("admin", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await API.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    const response = await API.get("/auth/me");
    return response.data;
  },

  /**
   * Update password
   */
  updatePassword: async (data) => {
    const response = await API.put("/auth/update-password", data);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  /**
   * Forgot password
   */
  forgotPassword: async (email) => {
    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Reset password
   */
  resetPassword: async (token, password) => {
    const response = await API.put(`/auth/reset-password/${token}`, { password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  },

  /**
   * Refresh token
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await API.post("/auth/refresh-token", { refreshToken });
    
    if (response.data.success) {
      const { token, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", newRefreshToken);
    }
    
    return response.data;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem("token");
    return !!token;
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get admin user from localStorage
   */
  getAdminUser: () => {
    try {
      const admin = localStorage.getItem("admin");
      return admin ? JSON.parse(admin) : null;
    } catch {
      return null;
    }
  },

  /**
   * Check if current user has specific role
   */
  hasRole: (role) => {
    const user = authApi.getCurrentUser();
    return user?.role === role;
  },

  /**
   * Check if user is admin or superadmin
   */
  isAdmin: () => {
    const user = authApi.getCurrentUser();
    return user ? ['admin', 'superadmin'].includes(user.role) : false;
  },

  /**
   * Check if user is vendor
   */
  isVendor: () => {
    const user = authApi.getCurrentUser();
    return user?.role === 'vendor';
  },

  /**
   * Check if user is superadmin
   */
  isSuperAdmin: () => {
    const user = authApi.getCurrentUser();
    return user?.role === 'superadmin';
  }
};

// Export individual functions for direct use
export const loginUser = authApi.login;
export const adminLogin = authApi.adminLogin;
export const registerUser = authApi.register;
export const logoutUser = authApi.logout;
export const getCurrentUser = authApi.getCurrentUser;
export const isAuthenticated = authApi.isAuthenticated;
export const isAdmin = authApi.isAdmin;

export default authApi;