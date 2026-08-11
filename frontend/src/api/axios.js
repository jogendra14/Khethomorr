import axios from "axios";

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:5000",

  headers: {
    "Content-Type": "application/json",
  },

  withCredentials: true,
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

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

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

API.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    // No request config
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Only handle 401 once
    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken =
        localStorage.getItem("refreshToken");

      // No refresh token
      if (!refreshToken) {
        handleAuthFailure();
        return Promise.reject(error);
      }

      try {
        // Refresh access token
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_URL ||
            "http://localhost:5000"
          }/api/auth/refresh-token`,
          {
            refreshToken,
          }
        );

        const data =
          response.data.data || response.data;

        const newToken = data.token;
        const newRefreshToken = data.refreshToken;

        // Save new tokens
        localStorage.setItem("token", newToken);

        if (newRefreshToken) {
          localStorage.setItem(
            "refreshToken",
            newRefreshToken
          );
        }

        // Update original request
        originalRequest.headers.Authorization =
          `Bearer ${newToken}`;

        // Retry original request
        return API(originalRequest);
      } catch (refreshError) {
        handleAuthFailure();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// AUTH FAILURE
// ============================================

const handleAuthFailure = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  const currentPath = window.location.pathname;

  if (currentPath.startsWith("/admin")) {
    window.location.href = "/admin/login";
  } else {
    window.location.href = "/login";
  }
};

export default API;