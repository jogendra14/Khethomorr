// frontend/src/api/productApi.js
import API from "./axios";

const ProductAPI = {
  // Get all products with filters
  getAllProducts: async (params = {}) => {
    const response = await API.get("/products", { params });
    return response.data;
  },

  // Get single product by ID
  getProductById: async (id) => {
    const response = await API.get(`/products/${id}`);
    return response.data;
  },

  // Get product by slug
  getProductBySlug: async (slug) => {
    const response = await API.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (limit = 8) => {
    const response = await API.get("/products/featured", {
      params: { limit }
    });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId, params = {}) => {
    const response = await API.get(`/products/category/${categoryId}`, {
      params
    });
    return response.data;
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    const response = await API.get("/products/search", {
      params: { q: query, ...params }
    });
    return response.data;
  },

  // Create product (Admin/Vendor)
  createProduct: async (formData) => {
    const response = await API.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Update product (Admin/Vendor)
  updateProduct: async (id, formData) => {
    const response = await API.put(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Delete product (Admin)
  deleteProduct: async (id) => {
    const response = await API.delete(`/products/${id}`);
    return response.data;
  },

  // Bulk delete products (Admin)
  bulkDeleteProducts: async (productIds) => {
    const response = await API.post("/products/bulk-delete", { productIds });
    return response.data;
  },

  // Update product status (Admin)
  updateProductStatus: async (id, status) => {
    const response = await API.patch(`/products/${id}/status`, { status });
    return response.data;
  },

  // Update product stock (Admin/Vendor)
  updateProductStock: async (id, stockData) => {
    const response = await API.patch(`/products/${id}/stock`, stockData);
    return response.data;
  },

  // Bulk update products (Admin)
  bulkUpdateProducts: async (productIds, updates) => {
    const response = await API.put("/products/bulk-update", {
      productIds,
      updates
    });
    return response.data;
  },

  // Get product statistics (Admin)
  getProductStats: async () => {
    const response = await API.get("/products/stats");
    return response.data;
  },

  // Add product variant (Admin/Vendor)
  addProductVariant: async (productId, variantData) => {
    const response = await API.post(
      `/products/${productId}/variants`,
      variantData
    );
    return response.data;
  },

  // Remove product variant (Admin/Vendor)
  removeProductVariant: async (productId, variantId) => {
    const response = await API.delete(
      `/products/${productId}/variants/${variantId}`
    );
    return response.data;
  },

  // Get products with advanced filters
  getFilteredProducts: async (filters) => {
    const params = {
      ...filters,
      page: filters.page || 1,
      limit: filters.limit || 12,
      sort: filters.sort || "-createdAt",
    };

    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
    if (filters.category) params.category = filters.category;
    if (filters.brand) params.brand = filters.brand;
    if (filters.tags) params.tags = filters.tags;
    if (filters.inStock) params.inStock = filters.inStock;
    if (filters.discount) params.discount = filters.discount;
    if (filters.minRating) params.minRating = filters.minRating;

    const response = await API.get("/products", { params });
    return response.data;
  },
};

export default ProductAPI;