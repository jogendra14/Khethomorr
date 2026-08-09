import API from './axios';

const authApi = {
  // Register new user
  register: (userData) =>
    API.post('/api/auth/register', userData),

  // Login user
  login: (credentials) =>
    API.post('/api/auth/login', credentials),

  // Verify email
  verifyEmail: (token) =>
    API.get(`/api/auth/verify-email/${token}`),

  // Resend verification email
  resendVerification: (email) =>
    API.post('/api/auth/resend-verification', { email }),

  // Forgot password
  forgotPassword: (email) =>
    API.post('/api/auth/forgot-password', { email }),

  // Reset password
  resetPassword: (token, password) =>
    API.post(`/api/auth/reset-password/${token}`, { password }),

  // Refresh token
  refreshToken: (refreshToken) =>
    API.post('/api/auth/refresh-token', { refreshToken }),

  // Get current user
  getMe: () =>
    API.get('/api/auth/me'),

  // Update password (logged in)
  updatePassword: (data) =>
    API.put('/api/auth/update-password', data),

  // Logout
  logout: () =>
    API.post('/api/auth/logout'),
};

export default authApi;