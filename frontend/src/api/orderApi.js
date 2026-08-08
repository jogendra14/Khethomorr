// frontend/src/api/orderApi.js
import API from "./axios";

const OrderAPI = {
  // Create new order
  createOrder: async (orderData) => {
    const response = await API.post("/orders", orderData);
    return response.data;
  },

  // Get user's orders
  getMyOrders: async (params = {}) => {
    const response = await API.get("/orders/my-orders", { params });
    return response.data;
  },

  // Get single order
  getOrderById: async (orderId) => {
    const response = await API.get(`/orders/${orderId}`);
    return response.data;
  },

  // Get all orders (Admin)
  getAllOrders: async (params = {}) => {
    const response = await API.get("/orders", { params });
    return response.data;
  },

  // Update order status (Admin)
  updateOrderStatus: async (orderId, status) => {
    const response = await API.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId, reason) => {
    const response = await API.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  // Track order
  trackOrder: async (orderId) => {
    const response = await API.get(`/orders/${orderId}/track`);
    return response.data;
  },

  // Get order statistics (Admin)
  getOrderStats: async () => {
    const response = await API.get("/orders/stats");
    return response.data;
  },
};

export default OrderAPI;