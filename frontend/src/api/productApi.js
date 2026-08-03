// frontend/src/api/productApi.js

import API from "./axios";

// ✅ Get all products
export const getProduct = async () => {
  try {
    const { data } = await API.get("/products");
    
    // Check if data has products array
    if (data && data.products) {
      return data.products; // Return only products array
    }
    
    // If response is already an array
    if (data && Array.isArray(data)) {
      return data;
    }
    
    // Fallback - return empty array
    console.warn("Unexpected API response format:", data);
    return [];
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

// ✅ Add Product
export const addProduct = async (formData) => {
  try {
    const response = await API.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

// ✅ Get Product By ID
export const getProductById = async (id) => {
  try {
    const res = await API.get(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

// ✅ Update Product
export const updateProduct = async (id, data) => {
  try {
    const res = await API.put(`/products/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

// ✅ Duplicate Product
export const duplicateProduct = async (id) => {
  try {
    const response = await API.post(
      `/products/${id}/duplicate`, // ✅ Fixed spelling
      {}
    );
    return response.data;
  } catch (error) {
    console.error("Error duplicating product:", error);
    throw error;
  }
};

// ✅ Delete Product
export const deleteProduct = async (id) => {
  try {
    const res = await API.delete(`/products/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};