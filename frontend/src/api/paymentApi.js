// frontend/src/api/paymentApi.js
import API from "./axios";

const PaymentAPI = {
  // Create payment intent
  createPaymentIntent: async (orderId) => {
    const response = await API.post("/payments/create-intent", { orderId });
    return response.data;
  },

  // Process payment
  processPayment: async (paymentData) => {
    const response = await API.post("/payments/process", paymentData);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (paymentId) => {
    const response = await API.get(`/payments/${paymentId}/status`);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (params = {}) => {
    const response = await API.get("/payments/history", { params });
    return response.data;
  },

  // Refund payment (Admin)
  refundPayment: async (paymentId, amount) => {
    const response = await API.post(`/payments/${paymentId}/refund`, {
      amount
    });
    return response.data;
  },
};

export default PaymentAPI;