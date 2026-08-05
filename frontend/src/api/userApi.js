// frontend/src/api/userApi.js
import API from "./axios";

// ============================================
// ✅ GET ALL USERS (Admin)
// ============================================
export const getUsers = async () => {
  try {
    const response = await API.get("/admin/users");
    return response.data.users || response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error.response?.data || { message: "Failed to fetch users" };
  }
};

// ============================================
// ✅ GET USER BY ID (Admin)
// ============================================
export const getUserById = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    const response = await API.get(`/admin/users/${id}`);
    return response.data.user || response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error.response?.data || { message: "Failed to fetch user" };
  }
};

// ============================================
// ✅ CREATE USER (Admin)
// ============================================
export const addUser = async (data) => {
  try {
    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      throw new Error("Name, email, and password are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format");
    }

    // Validate password length
    if (data.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const response = await API.post("/admin/users", data);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error.response?.data || { message: "Failed to create user" };
  }
};

// ============================================
// ✅ UPDATE USER (Admin)
// ============================================
export const updateUser = async (id, data) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    // Validate required fields
    if (!data.name || !data.email) {
      throw new Error("Name and email are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format");
    }

    const response = await API.put(`/admin/users/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error.response?.data || { message: "Failed to update user" };
  }
};

// ============================================
// ✅ UPDATE USER STATUS (Admin)
// ============================================
export const updateUserStatus = async (id, status) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    if (!status || !["Active", "Blocked"].includes(status)) {
      throw new Error("Invalid status. Must be 'Active' or 'Blocked'");
    }

    const response = await API.patch(`/admin/users/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error.response?.data || { message: "Failed to update user status" };
  }
};

// ============================================
// ✅ DELETE USER (Admin)
// ============================================
export const deleteUser = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    const response = await API.delete(`/admin/users/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error.response?.data || { message: "Failed to delete user" };
  }
};

// ============================================
// ✅ BULK DELETE USERS (Admin)
// ============================================
export const bulkDeleteUsers = async (ids) => {
  try {
    if (!ids || ids.length === 0) {
      throw new Error("User IDs are required");
    }

    const response = await API.delete("/admin/users/bulk", { data: { ids } });
    return response.data;
  } catch (error) {
    console.error("Error bulk deleting users:", error);
    throw error.response?.data || { message: "Failed to delete users" };
  }
};

// ============================================
// ✅ GET USER STATS (Admin)
// ============================================
export const getUserStats = async () => {
  try {
    const response = await API.get("/admin/users/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error.response?.data || { message: "Failed to fetch user stats" };
  }
};

// ============================================
// ✅ GET CURRENT USER PROFILE
// ============================================
export const getCurrentUserProfile = async () => {
  try {
    const response = await API.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error.response?.data || { message: "Failed to fetch user profile" };
  }
};

// ============================================
// ✅ UPDATE CURRENT USER PROFILE
// ============================================
export const updateCurrentUserProfile = async (data) => {
  try {
    // Validate required fields
    if (!data.name || !data.email) {
      throw new Error("Name and email are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format");
    }

    const response = await API.put("/auth/profile", data);
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error.response?.data || { message: "Failed to update profile" };
  }
};

// ============================================
// ✅ CHANGE USER PASSWORD
// ============================================
export const changeUserPassword = async (data) => {
  try {
    // Validate required fields
    if (!data.currentPassword || !data.newPassword) {
      throw new Error("Current password and new password are required");
    }

    // Validate new password length
    if (data.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    const response = await API.put("/auth/change-password", {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error.response?.data || { message: "Failed to change password" };
  }
};

// ============================================
// ✅ GET USER ORDERS
// ============================================
export const getUserOrders = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const response = await API.get(`/users/${userId}/orders`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user orders:", error);
    throw error.response?.data || { message: "Failed to fetch user orders" };
  }
};

// ============================================
// ✅ GET USER WISHLIST
// ============================================
export const getUserWishlist = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const response = await API.get(`/users/${userId}/wishlist`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user wishlist:", error);
    throw error.response?.data || { message: "Failed to fetch user wishlist" };
  }
};

// ============================================
// ✅ SEARCH USERS
// ============================================
export const searchUsers = async (query) => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const response = await API.get(`/admin/users/search?q=${encodeURIComponent(query)}`);
    return response.data.users || response.data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error.response?.data || { message: "Failed to search users" };
  }
};

// ============================================
// ✅ EXPORT ALL FUNCTIONS
// ============================================
export default {
  getUsers,
  getUserById,
  addUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  bulkDeleteUsers,
  getUserStats,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  changeUserPassword,
  getUserOrders,
  getUserWishlist,
  searchUsers,
};