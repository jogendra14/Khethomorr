// frontend/src/api/reviewApi.js
import API from "./axios";

// ✅ Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ✅ 1. Get product reviews with pagination
export const getProductReviews = async (productId, page = 1, limit = 10) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    const response = await API.get(`/reviews/product/${productId}`, {
      params: { page, limit },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching product reviews:", error);
    throw error.response?.data || { message: "Failed to fetch reviews" };
  }
};

// ✅ 2. Get review statistics
export const getReviewStats = async (productId) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    const response = await API.get(`/reviews/stats/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching review stats:", error);
    throw error.response?.data || { message: "Failed to fetch review stats" };
  }
};

// ✅ 3. Create a new review
export const createReview = async (data) => {
  try {
    // Validate required fields
    if (!data.productId) {
      throw new Error("Product ID is required");
    }
    
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    
    if (!data.comment || data.comment.trim().length < 10) {
      throw new Error("Review comment must be at least 10 characters");
    }

    const response = await API.post(`/reviews`, data, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error.response?.data || { message: "Failed to create review" };
  }
};

// ✅ 4. Update a review
export const updateReview = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Review ID is required");
    }

    if (data.rating && (data.rating < 1 || data.rating > 5)) {
      throw new Error("Rating must be between 1 and 5");
    }

    const response = await API.put(`/reviews/${id}`, data, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error.response?.data || { message: "Failed to update review" };
  }
};

// ✅ 5. Delete a review
export const deleteReview = async (id) => {
  try {
    if (!id) {
      throw new Error("Review ID is required");
    }

    const response = await API.delete(`/reviews/${id}`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error.response?.data || { message: "Failed to delete review" };
  }
};

// ✅ 6. Get user reviews
export const getUserReviews = async (userId, page = 1, limit = 10) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const response = await API.get(`/reviews/user/${userId}`, {
      params: { page, limit },
      ...getAuthHeaders(),
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching user reviews:", error);
    throw error.response?.data || { message: "Failed to fetch user reviews" };
  }
};

// ✅ 7. Get all reviews (Admin)
export const getAllReviews = async (page = 1, limit = 20, filters = {}) => {
  try {
    const response = await API.get(`/reviews`, {
      params: { page, limit, ...filters },
      ...getAuthHeaders(),
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    throw error.response?.data || { message: "Failed to fetch reviews" };
  }
};

// ✅ 8. Get product rating summary
export const getProductRatingSummary = async (productId) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    const response = await API.get(`/reviews/rating-summary/${productId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching rating summary:", error);
    throw error.response?.data || { message: "Failed to fetch rating summary" };
  }
};

// ✅ 9. Like a review
export const likeReview = async (id) => {
  try {
    if (!id) {
      throw new Error("Review ID is required");
    }

    const response = await API.post(`/reviews/${id}/like`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error liking review:", error);
    throw error.response?.data || { message: "Failed to like review" };
  }
};

// ✅ 10. Report a review
export const reportReview = async (id, reason) => {
  try {
    if (!id) {
      throw new Error("Review ID is required");
    }

    if (!reason || reason.trim().length < 5) {
      throw new Error("Please provide a reason (minimum 5 characters)");
    }

    const response = await API.post(`/reviews/${id}/report`, { reason }, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error("Error reporting review:", error);
    throw error.response?.data || { message: "Failed to report review" };
  }
};

// ✅ Export all functions
export default {
  getProductReviews,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews,
  getAllReviews,
  getProductRatingSummary,
  likeReview,
  reportReview,
};