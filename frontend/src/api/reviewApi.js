// frontend/src/api/reviewApi.js
import API from "./axios";

const ReviewAPI = {
  // Get reviews for a product
  getProductReviews: async (productId, params = {}) => {
    const response = await API.get(`/reviews/product/${productId}`, {
      params
    });
    return response.data;
  },

  // Create review
  createReview: async (productId, reviewData) => {
    const response = await API.post(`/reviews/product/${productId}`, reviewData);
    return response.data;
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    const response = await API.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete review
  deleteReview: async (reviewId) => {
    const response = await API.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Like/Unlike review
  likeReview: async (reviewId) => {
    const response = await API.post(`/reviews/${reviewId}/like`);
    return response.data;
  },

  // Get user's reviews
  getMyReviews: async (params = {}) => {
    const response = await API.get("/reviews/my-reviews", { params });
    return response.data;
  },

  // Report review
  reportReview: async (reviewId, reason) => {
    const response = await API.post(`/reviews/${reviewId}/report`, {
      reason
    });
    return response.data;
  },
};

export default ReviewAPI;