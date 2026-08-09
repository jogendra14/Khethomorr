import API from './axios';

const userApi = {
  // ========== PROFILE ==========
  // Get current user profile
  getProfile: () =>
    API.get('/api/users/profile'),

  // Update profile
  updateProfile: (data) =>
    API.put('/api/users/profile', data),

  // Change password
  changePassword: (data) =>
    API.put('/api/users/change-password', data),

  // Change email
  changeEmail: (data) =>
    API.put('/api/users/change-email', data),

  // Upload avatar
  uploadAvatar: (formData) =>
    API.post('/api/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete own account
  deleteAccount: (password) =>
    API.delete('/api/users/account', { data: { password } }),

  // Get addresses
  getAddresses: () =>
    API.get('/api/users/addresses'),

  // Update address
  updateAddress: (data) =>
    API.put('/api/users/address', data),

  // ========== ADMIN ==========
  // Get all users (admin)
  getUsers: (params) =>
    API.get('/api/users', { params }),

  // Get user by ID (admin)
  getUserById: (id) =>
    API.get(`/api/users/${id}`),

  // Update user (admin)
  updateUser: (id, data) =>
    API.put(`/api/users/${id}`, data),

  // Delete user (admin)
  deleteUser: (id) =>
    API.delete(`/api/users/${id}`),

  // Toggle user status (admin)
  toggleUserStatus: (id) =>
    API.patch(`/api/users/${id}/toggle-status`),

  // Update user role (admin)
  updateUserRole: (id, role) =>
    API.patch(`/api/users/${id}/role`, { role }),

  // Get vendors (admin)
  getVendors: (params) =>
    API.get('/api/users/vendors', { params }),

  // Get admins (superadmin)
  getAdmins: () =>
    API.get('/api/users/admins'),

  // Get user stats (admin)
  getUserStats: () =>
    API.get('/api/users/stats'),

  // Bulk delete users (admin)
  bulkDeleteUsers: (userIds) =>
    API.delete('/api/users/bulk', { data: { userIds } }),

  // Bulk update users (admin)
  bulkUpdateUsers: (data) =>
    API.patch('/api/users/bulk', data),
};

export default userApi;