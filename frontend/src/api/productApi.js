import API from './axios';

const paymentApi = {
  // Initialize payment
  initialize: (data) =>
    API.post('/api/payments/initialize', data),

  // Verify payment
  verify: (data) =>
    API.post('/api/payments/verify', data),

  // Get my payments
  getMyPayments: (params) =>
    API.get('/api/payments', { params }),

  // Get payment by ID
  getById: (id) =>
    API.get(`/api/payments/${id}`),

  // ========== ADMIN ==========
  // Get all payments
  getAll: (params) =>
    API.get('/api/payments/admin/all', { params }),

  // Get payment stats
  getStats: () =>
    API.get('/api/payments/admin/stats'),

  // Process refund
  processRefund: (id, data) =>
    API.post(`/api/payments/${id}/refund`, data),
};

export default paymentApi;