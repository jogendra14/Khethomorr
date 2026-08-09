import API from './axios';

const dashboardApi = {
  // Get overview
  getOverview: () =>
    API.get('/api/dashboard/overview'),

  // Get sales analytics
  getSalesAnalytics: (params) =>
    API.get('/api/dashboard/sales-analytics', { params }),

  // Get product analytics
  getProductAnalytics: () =>
    API.get('/api/dashboard/product-analytics'),

  // Get user analytics
  getUserAnalytics: () =>
    API.get('/api/dashboard/user-analytics'),

  // Get revenue analytics
  getRevenueAnalytics: (year) =>
    API.get('/api/dashboard/revenue-analytics', { params: { year } }),

  // Get real-time metrics
  getRealTimeMetrics: () =>
    API.get('/api/dashboard/realtime'),

  // Export data
  exportData: (params) =>
    API.get('/api/dashboard/export', { params }),
};

export default dashboardApi;