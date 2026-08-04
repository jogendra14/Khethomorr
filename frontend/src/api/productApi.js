// frontend/src/api/reviewApi.js
import API from "./axios";

export const getProductReviews = async (productId, page = 1, limit = 10) => {
  try {
    const response = await API.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Get reviews error:", error);
    throw error.response?.data || { message: "Failed to fetch reviews" };
  }
};

export const getReviewStats = async (productId) => {
  try {
    const response = await API.get(`/reviews/stats/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Get stats error:", error);
    throw error.response?.data || { message: "Failed to fetch stats" };
  }
};

export const createReview = async (data) => {
  try {
    const response = await API.post(`/reviews`, data);
    return response.data;
  } catch (error) {
    console.error("Create review error:", error);
    throw error.response?.data || { message: "Failed to create review" };
  }
};

export const updateReview = async (id, data) => {
  try {
    const response = await API.put(`/reviews/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Update review error:", error);
    throw error.response?.data || { message: "Failed to update review" };
  }
};

export const deleteReview = async (id) => {
  try {
    const response = await API.delete(`/reviews/${id}`);
    return response.data;
  } catch (error) {
    console.error("Delete review error:", error);
    throw error.response?.data || { message: "Failed to delete review" };
  }
};