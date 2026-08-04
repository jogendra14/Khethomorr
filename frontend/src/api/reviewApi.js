// frontend/src/api/reviewApi.js
import API from "./axios";

export const getProductReviews = async (productId, page = 1, limit = 10) => {
  const response = await API.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`
  );
  return response.data;
};

export const getReviewStats = async (productId) => {
  const response = await API.get(`/reviews/stats/${productId}`);
  return response.data;
};

export const createReview = async (data) => {
  const response = await API.post(`reviews`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

export const updateReview = async (id, data) => {
  const response = await API.put(`/reviews/${id}`, data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

export const deleteReview = async (id) => {
  const response = await API.delete(`/reviews/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};