import API from './axios';

const reviewApi = {
  // ========== PUBLIC ==========
  // Get product reviews
  getProductReviews: (productId, params) =>
    API.get(`/api/reviews/product/${productId}`, { params }),

  // Get review stats
  getReviewStats: (productId) =>
    API.get(`/api/reviews/stats/${productId}`),

  // Get single review
  getReviewById: (id) =>
    API.get(`/api/reviews/${id}`),

  // ========== USER ==========
  // Create review
  createReview: (data) =>
    API.post('/api/reviews', data),

  // Get my reviews
  getMyReviews: (params) =>
    API.get('/api/reviews/user/my-reviews', { params }),

  // Update review
  updateReview: (id, data) =>
    API.put(`/api/reviews/${id}`, data),

  // Delete review
  deleteReview: (id) =>
    API.delete(`/api/reviews/${id}`),

  // Mark helpful
  markHelpful: (id) =>
    API.patch(`/api/reviews/${id}/helpful`),

  // Report review
  reportReview: (id, reason) =>
    API.patch(`/api/reviews/${id}/report`, { reason }),

  // ========== ADMIN ==========
  // Get all reviews
  getAllReviews: (params) =>
    API.get('/api/reviews/admin/all', { params }),

  // Add admin reply
  addReply: (id, comment) =>
    API.post(`/api/reviews/${id}/reply`, { comment }),

  // Update review status
  updateStatus: (id, status) =>
    API.patch(`/api/reviews/${id}/status`, { status }),
};

export default reviewApi;