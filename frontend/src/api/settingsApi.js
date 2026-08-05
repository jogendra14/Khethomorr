// frontend/src/api/settingsApi.js
import API from "./axios";

// ============================================
// ✅ GET SETTINGS
// ============================================
export const getSettings = async () => {
  try {
    const response = await API.get("/admin/settings");
    return response.data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error.response?.data || { message: "Failed to fetch settings" };
  }
};

// ============================================
// ✅ UPDATE SETTINGS
// ============================================
export const updateSettings = async (data) => {
  try {
    // Validate required fields
    if (!data.adminName || !data.email || !data.websiteName) {
      throw new Error("Admin name, email, and website name are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new Error("Invalid email format");
    }

    const response = await API.put("/admin/settings", data);
    return response.data;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error.response?.data || { message: "Failed to update settings" };
  }
};

// ============================================
// ✅ CHANGE ADMIN PASSWORD
// ============================================
export const changeAdminPassword = async (data) => {
  try {
    // Validate required fields
    if (!data.currentPassword || !data.newPassword) {
      throw new Error("Current password and new password are required");
    }

    // Validate new password length
    if (data.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    // Check if passwords match (should be handled in component)
    if (data.newPassword !== data.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const response = await API.put("/admin/change-password", {
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
// ✅ UPDATE ADMIN PROFILE
// ============================================
export const updateAdminProfile = async (data) => {
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

    const response = await API.put("/admin/profile", data);
    return response.data;
  } catch (error) {
    console.error("Error updating admin profile:", error);
    throw error.response?.data || { message: "Failed to update profile" };
  }
};

// ============================================
// ✅ GET ADMIN PROFILE
// ============================================
export const getAdminProfile = async () => {
  try {
    const response = await API.get("/admin/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};

// ============================================
// ✅ GET DASHBOARD STATS
// ============================================
export const getDashboardStats = async () => {
  try {
    const response = await API.get("/admin/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error.response?.data || { message: "Failed to fetch dashboard stats" };
  }
};

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
// ✅ CREATE USER (Admin)
// ============================================
export const createUser = async (data) => {
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
// ✅ GET CATEGORIES (Admin)
// ============================================
export const getCategories = async () => {
  try {
    const response = await API.get("/admin/categories");
    return response.data.categories || response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error.response?.data || { message: "Failed to fetch categories" };
  }
};

// ============================================
// ✅ CREATE CATEGORY (Admin)
// ============================================
export const createCategory = async (data) => {
  try {
    if (!data.name) {
      throw new Error("Category name is required");
    }

    const response = await API.post("/admin/categories", data);
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error.response?.data || { message: "Failed to create category" };
  }
};

// ============================================
// ✅ UPDATE CATEGORY (Admin)
// ============================================
export const updateCategory = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }

    if (!data.name) {
      throw new Error("Category name is required");
    }

    const response = await API.put(`/admin/categories/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error.response?.data || { message: "Failed to update category" };
  }
};

// ============================================
// ✅ DELETE CATEGORY (Admin)
// ============================================
export const deleteCategory = async (id) => {
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }

    const response = await API.delete(`/admin/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error.response?.data || { message: "Failed to delete category" };
  }
};

// ============================================
// ✅ GET CATEGORIES WITH PRODUCT COUNTS
// ============================================
export const getCategoriesWithCounts = async () => {
  try {
    const response = await API.get("/admin/categories");
    return response.data.categories || response.data;
  } catch (error) {
    console.error("Error fetching categories with counts:", error);
    throw error.response?.data || { message: "Failed to fetch categories" };
  }
};

// ============================================
// ✅ EXPORT ALL FUNCTIONS
// ============================================
export default {
  getSettings,
  updateSettings,
  changeAdminPassword,
  updateAdminProfile,
  getAdminProfile,
  getDashboardStats,
  getUsers,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesWithCounts,
};