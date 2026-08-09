import API from './axios';

const dealApi = {
  // ========== PUBLIC ==========
  // Get active deals
  getDeals: (params) =>
    API.get('/api/deals', { params }),

  // Get featured deals
  getFeatured: (limit) =>
    API.get('/api/deals/featured', { params: { limit } }),

  // Get deal by ID
  getById: (id) =>
    API.get(`/api/deals/${id}`),

  // Get deal by slug
  getBySlug: (slug) =>
    API.get(`/api/deals/slug/${slug}`),

  // Track click
  trackClick: (id) =>
    API.post(`/api/deals/${id}/track-click`),

  // ========== ADMIN ==========
  // Create deal
  create: (formData) =>
    API.post('/api/deals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Get all deals (admin)
  getAll: (params) =>
    API.get('/api/deals/admin/all', { params }),

  // Get deal stats
  getStats: () =>
    API.get('/api/deals/admin/stats'),

  // Update deal
  update: (id, formData) =>
    API.put(`/api/deals/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete deal
  delete: (id) =>
    API.delete(`/api/deals/${id}`),

  // Bulk delete
  bulkDelete: (dealIds) =>
    API.delete('/api/deals/bulk/delete', { data: { dealIds } }),

  // Toggle status
  toggleStatus: (id) =>
    API.patch(`/api/deals/${id}/toggle`),

  // Pause deal
  pause: (id) =>
    API.patch(`/api/deals/${id}/pause`),

  // Activate deal
  activate: (id) =>
    API.patch(`/api/deals/${id}/activate`),
};

export default dealApi;