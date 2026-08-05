// frontend/src/api/productApi.js
import API from "./axios";

// ✅ Get products with pagination + filters
export const getProduct = async (params = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      subCategory,
      brand,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
      search,
    } = params;

    const { data } = await API.get("/products", {
      params: {
        page,
        limit,
        category,
        subCategory,
        brand,
        minPrice,
        maxPrice,
        sort,
        order,
        search,
      },
    });

    return {
      products: data?.products || [],
      pagination: data?.pagination || {
        total: 0,
        page,
        limit,
        pages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };

  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// ✅ Get Single Product By ID
export const getProductById = async (id) => {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }
    
    const { data } = await API.get(`/products/${id}`);
    
    if (!data) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// ✅ Add Product
export const addProduct = async (formData) => {
  try {
    // Validate required fields
    const requiredFields = ['category', 'subCategory', 'brand', 'name', 'MRP', 'sellingPrice', 'stock'];
    for (const field of requiredFields) {
      if (!formData.get(field)) {
        throw new Error(`❌ ${field} is required`);
      }
    }

    // Validate images
    const images = formData.getAll('images');
    if (images.length === 0) {
      throw new Error("❌ Please select at least one image");
    }

    const response = await API.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error adding product:", error);
    
    // Log the full error response
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
    }
    
    throw error;
  }
};

// ✅ Update Product
export const updateProduct = async (id, data) => {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }

    const response = await API.put(`/products/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

// ✅ Duplicate Product
export const duplicateProduct = async (id) => {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }

    const response = await API.post(`/products/${id}/duplicate`, {});
    return response.data;
  } catch (error) {
    console.error("Error duplicating product:", error);
    throw error;
  }
};

// ✅ Delete Product
export const deleteProduct = async (id) => {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }

    const response = await API.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

// ✅ Get Products by Category
export const getProductsByCategory = async (category, params = {}) => {
  try {
    const { page = 1, limit = 20, sort = "createdAt", order = "desc" } = params;
    
    const { data } = await API.get(`/products/category/${category}`, {
      params: { page, limit, sort, order },
    });
    
    return {
      products: data?.products || [],
      pagination: data?.pagination || {
        total: 0,
        page,
        limit,
        pages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  } catch (error) {
    console.error(`Error fetching products by category ${category}:`, error);
    throw error;
  }
};

// ✅ Get Products by Brand
export const getProductsByBrand = async (brand, params = {}) => {
  try {
    const { page = 1, limit = 20, sort = "createdAt", order = "desc" } = params;
    
    const { data } = await API.get(`/products/brand/${brand}`, {
      params: { page, limit, sort, order },
    });
    
    return {
      products: data?.products || [],
      pagination: data?.pagination || {
        total: 0,
        page,
        limit,
        pages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  } catch (error) {
    console.error(`Error fetching products by brand ${brand}:`, error);
    throw error;
  }
};

// ✅ Search Products
export const searchProducts = async (query, params = {}) => {
  try {
    const { page = 1, limit = 20 } = params;
    
    if (!query || query.trim().length === 0) {
      return {
        products: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };
    }

    const { data } = await API.get(`/products/search/${encodeURIComponent(query)}`, {
      params: { page, limit },
    });
    
    return {
      products: data?.products || [],
      pagination: data?.pagination || {
        total: 0,
        page,
        limit,
        pages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  } catch (error) {
    console.error(`Error searching products for "${query}":`, error);
    throw error;
  }
};

// ✅ Bulk Delete Products
export const bulkDeleteProducts = async (ids) => {
  try {
    if (!ids || ids.length === 0) {
      throw new Error("Product IDs are required");
    }

    const response = await API.delete("/products/bulk", {
      data: { ids },
    });
    
    return response.data;
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    throw error;
  }
};

// ✅ Update Product Stock
export const updateProductStock = async (id, stock) => {
  try {
    if (!id) {
      throw new Error("Product ID is required");
    }

    const response = await API.patch(`/products/${id}/stock`, { stock });
    return response.data;
  } catch (error) {
    console.error(`Error updating stock for product ${id}:`, error);
    throw error;
  }
};

export default {
  getProduct,
  getProductById,
  addProduct,
  updateProduct,
  duplicateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByBrand,
  searchProducts,
  bulkDeleteProducts,
  updateProductStock,
};