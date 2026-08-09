// frontend/src/api/categoryApi.js
import API from "./axios";

const CategoryAPI = {
  // Get all categories
  getAllCategories: async () => {
    const response = await API.get("/categories");
    return response.data;
  },

  // Get single category
  getCategoryById: async (categoryId) => {
    const response = await API.get(`/categories/${categoryId}`);
    return response.data;
  },

  // Get category by slug
  getCategoryBySlug: async (slug) => {
    const response = await API.get(`/categories/slug/${slug}`);
    return response.data;
  },

  // Get subcategories
  getSubCategories: async (categoryId) => {
    const response = await API.get(`/categories/${categoryId}/subcategories`);
    return response.data;
  },

  // Create category (Admin)
  createCategory: async (categoryData) => {
    const response = await API.post("/categories", categoryData);
    return response.data;
  },

  // Update category (Admin)
  updateCategory: async (categoryId, categoryData) => {
    const response = await API.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  // Delete category (Admin)
  deleteCategory: async (categoryId) => {
    const response = await API.delete(`/categories/${categoryId}`);
    return response.data;
  },
  
  // --- get tree stucture ---
  getCategoryTree: async () => {
    const response = await API.get("/categories/tree");
    return response.data;
  },
};

export default CategoryAPI;