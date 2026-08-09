import API from './axios';

const categoryApi = {
  // ========== PUBLIC ==========
  // Get all categories
  getCategories: (params) =>
    API.get('/api/categories', { params }),

  // Get featured categories
  getFeatured: (limit) =>
    API.get('/api/categories/featured', { params: { limit } }),

  // Search categories
  search: (query) =>
    API.get('/api/categories/search', { params: { q: query } }),

  // Get category by ID
  getById: (id) =>
    API.get(`/api/categories/${id}`),

  // Get category by slug
  getBySlug: (slug) =>
    API.get(`/api/categories/slug/${slug}`),

  // ========== ADMIN ==========
  // Create category
  create: (data) =>
    API.post('/api/categories', data),

  // Get all categories (admin)
  getAll: (params) =>
    API.get('/api/categories/admin/all', { params }),

  // Get category stats
  getStats: () =>
    API.get('/api/categories/admin/stats'),

  // Update category
  update: (id, data) =>
    API.put(`/api/categories/${id}`, data),

  // Delete category
  delete: (id, force) =>
    API.delete(`/api/categories/${id}`, { params: { force } }),

  // Bulk delete
  bulkDelete: (ids) =>
    API.delete('/api/categories/bulk/delete', { data: { ids } }),

  // Toggle status
  toggleStatus: (id) =>
    API.patch(`/api/categories/${id}/toggle`),

  // Bulk toggle
  bulkToggle: (data) =>
    API.patch('/api/categories/bulk/toggle', data),

  // Reorder
  reorder: (orders) =>
    API.patch('/api/categories/reorder/list', { data: { orders } }),
};

export default categoryApi;