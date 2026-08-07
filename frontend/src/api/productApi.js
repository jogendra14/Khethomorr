// frontend/src/productAPI.js

import API from "./axios";

// ✅ Create Product
export const createProduct = async (productData) => {
  try {
    const response = await API.post(
      "/products/create",
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Get All Products with filtering, sorting & pagination
export const getAllProducts = async (params = {}) => {
  try {
    const response = await API.get("/products", { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Get Single Product by ID
export const getProductById = async (id) => {
  try {
    const response = await API.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Update Product
export const updateProduct = async (id, productData) => {
  try {
    const response = await API.put(
      `/products/${id}`,
      productData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Delete Product
export const deleteProduct = async (id) => {
  try {
    const response = await API.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Get Product Types
export const getProductTypes = async () => {
  try {
    const response = await API.get("/products/types");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Get Product Count by Type (for dashboard)
export const getProductCountByType = async () => {
  try {
    const response = await API.get("/products/count-by-type");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Get Template Fields for Product Type
export const getTemplateFields = async (productType) => {
  try {
    const response = await API.get(
      `/products/template-fields/${productType}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// ✅ Bulk Delete Products
export const bulkDeleteProducts = async (ids) => {
  try {
    const response = await API.post(
      "/products/bulk-delete",
      { ids }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};