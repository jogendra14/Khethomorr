// frontend/src/api/categoryApi.js
import API from "./axios";

// ============================================
// ✅ GET ALL CATEGORIES
// ============================================
export const getCategories = async () => {
  try {
    const response = await API.get("/admin/categories");
    // ✅ FIX: response.data.data use karein (Backend se 'data' key mein aa raha hai)
    return response.data.data || response.data.categories || []; 
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error.response?.data || { message: "Failed to fetch categories" };
  }
};

// ============================================
// ✅ GET CATEGORIES WITH PRODUCT COUNTS
// ============================================
export const getCategoriesWithCounts = async () => {
  try {
    const response = await API.get("/admin/categories");
    return response.data.data || response.data.categories || [];
  } catch (error) {
    console.error("Error fetching categories with counts:", error);
    throw error.response?.data || { message: "Failed to fetch categories" };
  }
};

// ============================================
// ✅ GET CATEGORY BY ID
// ============================================
export const getCategoryById = async (id) => {
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }

    const response = await API.get(`/admin/categories/${id}`);
    return response.data.data || response.data.category || response.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error.response?.data || { message: "Failed to fetch category" };
  }
};

// ============================================
// ✅ CREATE CATEGORY
// ============================================
export const addCategory = async (data) => {
  try {
    // Validate required fields
    if (!data.name) {
      throw new Error("Category name is required");
    }

    // Check if category name is valid
    if (data.name.trim().length < 2) {
      throw new Error("Category name must be at least 2 characters");
    }

    const response = await API.post("/admin/categories", {
      name: data.name.trim(),
      icon: data.icon || "",
      image: data.image || "",
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating category:", error);
    throw error.response?.data || { message: "Failed to create category" };
  }
};

// ============================================
// ✅ UPDATE CATEGORY
// ============================================
export const updateCategory = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }

    if (!data.name) {
      throw new Error("Category name is required");
    }

    if (data.name.trim().length < 2) {
      throw new Error("Category name must be at least 2 characters");
    }

    const response = await API.put(`/admin/categories/${id}`, {
      name: data.name.trim(),
      icon: data.icon || "",
      image: data.image || "",
    });
    
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error.response?.data || { message: "Failed to update category" };
  }
};

// ============================================
// ✅ DELETE CATEGORY
// ============================================
export const deleteCategory = async (id) => {
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }

    const response = await API.delete(`/admin/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error.response?.data || { message: "Failed to delete category" };
  }
};

// ============================================
// ✅ BULK DELETE CATEGORIES
// ============================================
export const bulkDeleteCategories = async (ids) => {
  try {
    if (!ids || ids.length === 0) {
      throw new Error("Category IDs are required");
    }

    const response = await API.delete("/admin/categories/bulk", { data: { ids } });
    return response.data;
  } catch (error) {
    console.error("Error bulk deleting categories:", error);
    throw error.response?.data || { message: "Failed to delete categories" };
  }
};

// ============================================
// ✅ GET CATEGORY PRODUCTS
// ============================================
export const getCategoryProducts = async (categoryId, params = {}) => {
  try {
    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    const { page = 1, limit = 20, sort = "createdAt", order = "desc" } = params;

    const response = await API.get(`/admin/categories/${categoryId}/products`, {
      params: { page, limit, sort, order },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error fetching category products:", error);
    throw error.response?.data || { message: "Failed to fetch category products" };
  }
};

// ============================================
// ✅ GET CATEGORY STATS
// ============================================
export const getCategoryStats = async () => {
  try {
    const response = await API.get("/admin/categories/stats");
    return response.data;
  } catch (error) {
    console.error("Error fetching category stats:", error);
    throw error.response?.data || { message: "Failed to fetch category stats" };
  }
};

// ============================================
// ✅ UPDATE CATEGORY STATUS
// ============================================
export const updateCategoryStatus = async (id, status) => {
  try {
    if (!id) {
      throw new Error("Category ID is required");
    }

    if (!status || !["Active", "Inactive"].includes(status)) {
      throw new Error("Invalid status. Must be 'Active' or 'Inactive'");
    }

    const response = await API.patch(`/admin/categories/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Error updating category status:", error);
    throw error.response?.data || { message: "Failed to update category status" };
  }
};

// ============================================
// ✅ SEARCH CATEGORIES
// ============================================
export const searchCategories = async (query) => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const response = await API.get(`/admin/categories/search?q=${encodeURIComponent(query)}`);
    return response.data.categories || response.data;
  } catch (error) {
    console.error("Error searching categories:", error);
    throw error.response?.data || { message: "Failed to search categories" };
  }
};

// ============================================
// ✅ GET SUBCATEGORIES BY CATEGORY
// ============================================
export const getSubCategoriesByCategory = async (categoryId) => {
  try {
    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    const response = await API.get(`/admin/categories/${categoryId}/subcategories`);
    return response.data.subCategories || response.data;
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    throw error.response?.data || { message: "Failed to fetch subcategories" };
  }
};

// ============================================
// ✅ CREATE SUBCATEGORY
// ============================================
export const createSubCategory = async (data) => {
  try {
    // Validate required fields
    if (!data.name || !data.categoryId) {
      throw new Error("Subcategory name and category ID are required");
    }

    if (data.name.trim().length < 2) {
      throw new Error("Subcategory name must be at least 2 characters");
    }

    const response = await API.post("/admin/subcategories", {
      name: data.name.trim(),
      categoryId: data.categoryId,
      icon: data.icon || "",
      image: data.image || "",
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating subcategory:", error);
    throw error.response?.data || { message: "Failed to create subcategory" };
  }
};

// ============================================
// ✅ UPDATE SUBCATEGORY
// ============================================
export const updateSubCategory = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Subcategory ID is required");
    }

    if (!data.name) {
      throw new Error("Subcategory name is required");
    }

    if (data.name.trim().length < 2) {
      throw new Error("Subcategory name must be at least 2 characters");
    }

    const response = await API.put(`/admin/subcategories/${id}`, {
      name: data.name.trim(),
      icon: data.icon || "",
      image: data.image || "",
    });
    
    return response.data;
  } catch (error) {
    console.error("Error updating subcategory:", error);
    throw error.response?.data || { message: "Failed to update subcategory" };
  }
};

// ============================================
// ✅ DELETE SUBCATEGORY
// ============================================
export const deleteSubCategory = async (id) => {
  try {
    if (!id) {
      throw new Error("Subcategory ID is required");
    }

    const response = await API.delete(`/admin/subcategories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting subcategory:", error);
    throw error.response?.data || { message: "Failed to delete subcategory" };
  }
};

// ============================================
// ✅ GET SUBCATEGORIES WITH COUNTS
// ============================================
export const getSubCategoriesWithCounts = async (categoryId) => {
  try {
    const params = categoryId ? { categoryId } : {};
    
    const response = await API.get("/admin/subcategories", { params });
    return response.data.subCategories || response.data;
  } catch (error) {
    console.error("Error fetching subcategories with counts:", error);
    throw error.response?.data || { message: "Failed to fetch subcategories" };
  }
};

// ============================================
// ✅ EXPORT ALL FUNCTIONS
// ============================================
export default {
  getCategories,
  getCategoriesWithCounts,
  getCategoryById,
  addCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  getCategoryProducts,
  getCategoryStats,
  updateCategoryStatus,
  searchCategories,
  getSubCategoriesByCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoriesWithCounts,
};
