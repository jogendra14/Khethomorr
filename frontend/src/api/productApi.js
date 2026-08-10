import API from './axios';

const productApi = {
  // ========== PUBLIC ==========
  // Get all products
  getProducts: (params) =>
    API.get('/api/products', { params }),

  // Get featured products
  getFeatured: (limit) =>
    API.get('/api/products/featured', { params: { limit } }),

  // Get best selling products
  getBestSelling: (limit) =>
    API.get('/api/products/best-selling', { params: { limit } }),

  // Get new arrivals
  getNewArrivals: (days, limit) =>
    API.get('/api/products/new-arrivals', { params: { days, limit } }),

  // Search products
  searchProducts: (query, params) =>
    API.get('/api/products/search', { params: { q: query, ...params } }),

  // Get products by category
  getProductsByCategory: (categoryId, params) =>
    API.get(`/api/products/category/${categoryId}`, { params }),

  // Get product by ID
  getProductById: (id) =>
    API.get(`/api/products/${id}`),

  // Get product by slug
  getProductBySlug: (slug) =>
    API.get(`/api/products/slug/${slug}`),

  // Get related products
  getRelatedProducts: (id) =>
    API.get(`/api/products/${id}/related`),

  // ========== ADMIN/VENDOR ==========
  // Create product
  createProduct: (formData) =>
    API.post('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Update product
  updateProduct: (id, formData) =>
    API.put(`/api/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Delete product (soft)
  deleteProduct: (id) =>
    API.delete(`/api/products/${id}`),

  // Permanent delete
  permanentDelete: (id) =>
    API.delete(`/api/products/${id}/permanent`),

  // Bulk delete
  bulkDelete: (productIds) =>
    API.delete('/api/products/bulk', { data: { productIds } }),

  // Bulk update
  bulkUpdate: (data) =>
    API.patch('/api/products/bulk', data),

  // Update stock
  updateStock: (id, data) =>
    API.patch(`/api/products/${id}/stock`, data),

  // Get low stock products
  getLowStock: () =>
    API.get('/api/products/low-stock/list'),

  // Update product status
  updateStatus: (id, status) =>
    API.patch(`/api/products/${id}/status`, { status }),

  // Toggle featured
  toggleFeatured: (id) =>
    API.patch(`/api/products/${id}/toggle-featured`),

  // Get product stats (admin)
  getStats: () =>
    API.get('/api/products/stats/overview'),

  // ========== VARIANTS ==========
  // Add variant
  addVariant: (productId, data) =>
    API.post(`/api/products/${productId}/variants`, data),

  // Update variant
  updateVariant: (productId, variantId, data) =>
    API.put(`/api/products/${productId}/variants/${variantId}`, data),

  // Delete variant
  deleteVariant: (productId, variantId) =>
    API.delete(`/api/products/${productId}/variants/${variantId}`),
};

export default productApi;