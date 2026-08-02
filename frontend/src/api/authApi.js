// frontend/src/api/authApi.js

import API from "./axios.js";

// 1. Check if user exists
export const checkUserExists = async (email) => {
  try {
    const response = await API.post("/auth/check-email", { email });
    return response.data; // { exists: true/false }
  } catch (error) {
    console.error("Error checking email:", error);
    return { exists: false };
  }
};

// 2. Register user
export const registerUser = async (userData) => {
  try {
    const response = await API.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    // Throw error so it can be caught in the component
    throw error.response?.data || { message: "Registration failed" };
  }
};

// 3. Login user
export const loginUser = async (userData) => {
  try {
    const response = await API.post("/auth/login", userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

// 4. Get current user profile (optional)
export const getCurrentUser = async () => {
  try {
    const response = await API.get("/auth/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to get user" };
  }
};

// 5. Logout user (optional)
export const logoutUser = async () => {
  try {
    const response = await API.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Logout failed" };
  }
};