import API from './axios';

const couponApi = {
  // ========== PUBLIC ==========
  // Get available coupons
  getAvailable: () =>
    API.get('/api/coupons/available'),

  // Validate coupon
  validate: (data) =>
    API.post('/api/coupons/validate', data),

  // ========== ADMIN ==========
  // Create coupon
  create: (data) =>
    API.post('/api/coupons', data),

  // Get all coupons
  getAll: (params) =>
    API.get('/api/coupons', { params }),

  // Get coupon by ID
  getById: (id) =>
    API.get(`/api/coupons/${id}`),

  // Update coupon
  update: (id, data) =>
    API.put(`/api/coupons/${id}`, data),

  // Delete coupon
  delete: (id) =>
    API.delete(`/api/coupons/${id}`),

  // Get coupon stats
  getStats: () =>
    API.get('/api/coupons/stats'),
};

export default couponApi;