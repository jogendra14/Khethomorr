// frontend/src/api/authApi.js

import API from "./axios.js";

// ✅ 1. Check if user exists
export const checkUserExists = async (email) => {
  try {
    if (!email || email.trim() === '') {
      return { exists: false, error: "Email is required" };
    }

    const response = await API.post("/auth/check-email", { email });
    return response.data; // { exists: true/false }
  } catch (error) {
    console.error("Error checking email:", error);
    
    // Return a structured error response
    if (error.response) {
      return { 
        exists: false, 
        error: error.response.data?.message || "Server error" 
      };
    }
    
    return { exists: false, error: "Network error. Please try again." };
  }
};

// ✅ 2. Register user
export const registerUser = async (userData) => {
  try {
    // Validate required fields
    const requiredFields = ['name', 'email', 'password'];
    for (const field of requiredFields) {
      if (!userData[field]) {
        throw new Error(`${field} is required`);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error("Invalid email format");
    }

    // Validate password length
    if (userData.password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const response = await API.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error
      throw {
        status: error.response.status,
        message: error.response.data?.message || "Registration failed",
        data: error.response.data
      };
    } else if (error.request) {
      // No response from server
      throw {
        message: "No response from server. Please check your connection."
      };
    } else {
      // Client-side error
      throw {
        message: error.message || "Registration failed"
      };
    }
  }
};

// ✅ 3. Login user
export const loginUser = async (userData) => {
  try {
    // Validate required fields
    if (!userData.email || !userData.password) {
      throw new Error("Email and password are required");
    }

    const response = await API.post("/auth/login", userData);
    
    // Validate response
    if (!response.data || !response.data.token) {
      throw new Error("Invalid response from server");
    }
    
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    
    if (error.response) {
      // Server responded with error
      throw {
        status: error.response.status,
        message: error.response.data?.message || "Login failed",
        data: error.response.data
      };
    } else if (error.request) {
      throw {
        message: "No response from server. Please check your connection."
      };
    } else {
      throw {
        message: error.message || "Login failed"
      };
    }
  }
};

// ✅ 4. Get current user profile
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await API.get("/auth/me");
    
    if (!response.data) {
      throw new Error("No user data received");
    }
    
    return response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    
    // If token is invalid, clear it
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    throw {
      message: error.response?.data?.message || "Failed to get user data",
      status: error.response?.status
    };
  }
};

// ✅ 5. Logout user
export const logoutUser = async () => {
  try {
    // Optional: Call logout endpoint
    const response = await API.post("/auth/logout");
    
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    
    // Even if server fails, clear local data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    throw {
      message: error.response?.data?.message || "Logout failed",
      status: error.response?.status
    };
  }
};

// ✅ 6. Forgot password
export const forgotPassword = async (email) => {
  try {
    if (!email || email.trim() === '') {
      throw new Error("Email is required");
    }

    const response = await API.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw {
      message: error.response?.data?.message || "Failed to send reset email",
      status: error.response?.status
    };
  }
};

// ✅ 7. Reset password
export const resetPassword = async (token, newPassword) => {
  try {
    if (!token) {
      throw new Error("Reset token is required");
    }
    
    if (!newPassword || newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }

    const response = await API.post("/auth/reset-password", { 
      token, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw {
      message: error.response?.data?.message || "Failed to reset password",
      status: error.response?.status
    };
  }
};

// ✅ 8. Update profile
export const updateProfile = async (userData) => {
  try {
    const response = await API.put("/auth/profile", userData);
    return response.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw {
      message: error.response?.data?.message || "Failed to update profile",
      status: error.response?.status
    };
  }
};

// ✅ 9. Change password
export const changePassword = async (currentPassword, newPassword) => {
  try {
    if (!currentPassword || !newPassword) {
      throw new Error("Current password and new password are required");
    }
    
    if (newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }

    const response = await API.put("/auth/change-password", { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    console.error("Change password error:", error);
    throw {
      message: error.response?.data?.message || "Failed to change password",
      status: error.response?.status
    };
  }
};

// ✅ Export all functions
export default {
  checkUserExists,
  registerUser,
  loginUser,
  getCurrentUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
};