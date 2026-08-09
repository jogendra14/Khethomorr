import API from './axios';

const subCategoryApi = {
  // ========== PUBLIC ==========
  // Get all subcategories
  getAll: (params) =>
    API.get('/api/subcategories', { params }),

  // Get with products
  getWithProducts: (limit) =>
    API.get('/api/subcategories/with-products', { params: { limit } }),

  // Get by category
  getByCategory: (categoryId, params) =>
    API.get(`/api/subcategories/category/${categoryId}`, { params }),

  // Get by ID
  getById: (id) =>
    API.get(`/api/subcategories/${id}`),

  // Get by slug
  getBySlug: (slug) =>
    API.get(`/api/subcategories/slug/${slug}`),

  // ========== ADMIN ==========
  // Create subcategory
  create: (data) =>
    API.post('/api/subcategories', data),

  // Get all (admin)
  getAdminAll: (params) =>
    API.get('/api/subcategories/admin/all', { params }),

  // Update
  update: (id, data) =>
    API.put(`/api/subcategories/${id}`, data),

  // Delete
  delete: (id, force) =>
    API.delete(`/api/subcategories/${id}`, { params: { force } }),

  // Bulk delete
  bulkDelete: (ids) =>
    API.delete('/api/subcategories/bulk/delete', { data: { ids } }),

  // Toggle status
  toggleStatus: (id) =>
    API.patch(`/api/subcategories/${id}/toggle`),

  // Bulk toggle
  bulkToggle: (data) =>
    API.patch('/api/subcategories/bulk/toggle', data),

  // Move subcategories
  move: (data) =>
    API.patch('/api/subcategories/move/bulk', data),
};

export default subCategoryApi;