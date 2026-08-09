import API from './axios';

const orderApi = {
  // ========== USER ==========
  // Create order
  createOrder: (data) =>
    API.post('/api/orders', data),

  // Get my orders
  getMyOrders: (params) =>
    API.get('/api/orders/my-orders', { params }),

  // Get order by ID
  getOrderById: (id) =>
    API.get(`/api/orders/${id}`),

  // Cancel order
  cancelOrder: (id, reason) =>
    API.patch(`/api/orders/${id}/cancel`, { reason }),

  // ========== ADMIN ==========
  // Get all orders
  getAllOrders: (params) =>
    API.get('/api/orders', { params }),

  // Get order stats
  getStats: () =>
    API.get('/api/orders/stats/overview'),

  // Update order status
  updateStatus: (id, status, note) =>
    API.patch(`/api/orders/${id}/status`, { status, note }),

  // Add tracking
  addTracking: (id, data) =>
    API.patch(`/api/orders/${id}/tracking`, data),

  // Update payment status
  updatePaymentStatus: (id, data) =>
    API.patch(`/api/orders/${id}/payment`, data),

  // Delete order
  deleteOrder: (id) =>
    API.delete(`/api/orders/${id}`),
};

export default orderApi;