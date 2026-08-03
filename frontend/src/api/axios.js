// frontend/src/api/axios.js

import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api", // ✅ Fallback URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor - Add Token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle Errors Globally
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    
    // Handle 500 Server Error
    if (error.response && error.response.status === 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

export default API;