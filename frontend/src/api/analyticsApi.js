// frontend/src/api/analyticsApi.js
import API from "./axios";

const AnalyticsAPI = {
  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await API.get("/analytics/dashboard");
    return response.data;
  },

  // Get sales data
  getSalesData: async (params = {}) => {
    const response = await API.get("/analytics/sales", { params });
    return response.data;
  },

  // Get revenue data
  getRevenueData: async (period = "monthly") => {
    const response = await API.get("/analytics/revenue", {
      params: { period }
    });
    return response.data;
  },

  // Get top products
  getTopProducts: async (limit = 10) => {
    const response = await API.get("/analytics/top-products", {
      params: { limit }
    });
    return response.data;
  },

  // Get customer stats
  getCustomerStats: async () => {
    const response = await API.get("/analytics/customers");
    return response.data;
  },

  // Get order analytics
  getOrderAnalytics: async (params = {}) => {
    const response = await API.get("/analytics/orders", { params });
    return response.data;
  },
};

export default AnalyticsAPI;