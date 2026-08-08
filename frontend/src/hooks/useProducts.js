// frontend/src/hooks/useProducts.js

import { useState, useCallback, useEffect } from "react";
import * as productAPI from "../api/productApi";

const useProducts = (options = {}) => {
  const {
    initialPage = 1,
    initialLimit = 10,
    autoFetch = false,
    fetchParams = {},
  } = options;

  // States
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState(fetchParams);
  const [productTypes, setProductTypes] = useState([]);
  const [templateFields, setTemplateFields] = useState([]);
  const [countByType, setCountByType] = useState({});

  // Toast hook for notifications
  const toast = useToast();

  // Fetch all products with filters
  const fetchProducts = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
          ...params,
        };
        
        const response = await productAPI.getAllProducts(queryParams);
        
        setProducts(response.data || []);
        setPagination({
          page: response.page || pagination.page,
          limit: response.limit || pagination.limit,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
        });
        return response;
      } catch (err) {
        setError(err.message || "Failed to fetch products");
        toast?.error(err.message || "Failed to fetch products");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit, filters, toast]
  );

  // Fetch single product by ID
  const fetchProductById = useCallback(
    async (id) => {
      if (!id) {
        setError("Product ID is required");
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await productAPI.getProductById(id);
        setProduct(response.data || response);
        return response.data || response;
      } catch (err) {
        setError(err.message || "Failed to fetch product");
        toast?.error(err.message || "Failed to fetch product");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Create new product
  const createProduct = useCallback(
    async (productData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await productAPI.createProduct(productData);
        toast?.success("Product created successfully!");
        
        // Optionally refresh the list
        if (autoFetch) {
          await fetchProducts();
        }
        
        return response.data || response;
      } catch (err) {
        setError(err.message || "Failed to create product");
        toast?.error(err.message || "Failed to create product");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [autoFetch, fetchProducts, toast]
  );

  // Update product
  const updateProduct = useCallback(
    async (id, productData) => {
      if (!id) {
        setError("Product ID is required");
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await productAPI.updateProduct(id, productData);
        
        // Update the product in state if it matches
        setProduct((prev) => {
          if (prev && prev._id === id) {
            return response.data || response;
          }
          return prev;
        });

        // Update in products list
        setProducts((prev) =>
          prev.map((p) =>
            p._id === id ? response.data || response : p
          )
        );

        toast?.success("Product updated successfully!");
        return response.data || response;
      } catch (err) {
        setError(err.message || "Failed to update product");
        toast?.error(err.message || "Failed to update product");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Delete product
  const deleteProduct = useCallback(
    async (id) => {
      if (!id) {
        setError("Product ID is required");
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        await productAPI.deleteProduct(id);
        
        // Remove from products list
        setProducts((prev) => prev.filter((p) => p._id !== id));
        
        // Clear selected product if it matches
        if (product && product._id === id) {
          setProduct(null);
        }

        toast?.success("Product deleted successfully!");
        return true;
      } catch (err) {
        setError(err.message || "Failed to delete product");
        toast?.error(err.message || "Failed to delete product");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [product, toast]
  );

  // Bulk delete products
  const bulkDeleteProducts = useCallback(
    async (ids) => {
      if (!ids || ids.length === 0) {
        setError("No products selected for deletion");
        return null;
      }

      setLoading(true);
      setError(null);
      try {
        await productAPI.bulkDeleteProducts(ids);
        
        // Remove deleted products from list
        setProducts((prev) => prev.filter((p) => !ids.includes(p._id)));
        
        toast?.success(`${ids.length} products deleted successfully!`);
        return true;
      } catch (err) {
        setError(err.message || "Failed to delete products");
        toast?.error(err.message || "Failed to delete products");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Fetch product types
  const fetchProductTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productAPI.getProductTypes();
      setProductTypes(response.data || response || []);
      return response.data || response;
    } catch (err) {
      setError(err.message || "Failed to fetch product types");
      toast?.error(err.message || "Failed to fetch product types");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch template fields for a specific product type
  const fetchTemplateFields = useCallback(
    async (productType) => {
      if (!productType) {
        setTemplateFields([]);
        return [];
      }

      setLoading(true);
      setError(null);
      try {
        const response = await productAPI.getTemplateFields(productType);
        setTemplateFields(response.data || response || []);
        return response.data || response;
      } catch (err) {
        setError(err.message || "Failed to fetch template fields");
        toast?.error(err.message || "Failed to fetch template fields");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  // Fetch product count by type
  const fetchCountByType = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productAPI.getProductCountByType();
      setCountByType(response.data || response || {});
      return response.data || response;
    } catch (err) {
      setError(err.message || "Failed to fetch product counts");
      toast?.error(err.message || "Failed to fetch product counts");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Reset filters and pagination
  const resetFilters = useCallback(() => {
    setFilters({});
    setPagination((prev) => ({
      ...prev,
      page: initialPage,
    }));
  }, [initialPage]);

  // Update filters
  const updateFilters = useCallback(
    (newFilters) => {
      setFilters((prev) => ({
        ...prev,
        ...newFilters,
      }));
      setPagination((prev) => ({
        ...prev,
        page: 1, // Reset to first page when filters change
      }));
    },
    []
  );

  // Change page
  const changePage = useCallback(
    (newPage) => {
      setPagination((prev) => ({
        ...prev,
        page: newPage,
      }));
    },
    []
  );

  // Change items per page
  const changeLimit = useCallback(
    (newLimit) => {
      setPagination((prev) => ({
        ...prev,
        limit: newLimit,
        page: 1,
      }));
    },
    []
  );

  // Auto-fetch on mount or when dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchProducts();
    }
  }, [autoFetch, pagination.page, pagination.limit, filters, fetchProducts]);

  // Return all the functionality
  return {
    // State
    products,
    product,
    loading,
    error,
    pagination,
    filters,
    productTypes,
    templateFields,
    countByType,

    // CRUD Operations
    fetchProducts,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDeleteProducts,

    // Utility functions
    fetchProductTypes,
    fetchTemplateFields,
    fetchCountByType,
    resetFilters,
    updateFilters,
    changePage,
    changeLimit,

    // Setters for direct state manipulation
    setProducts,
    setProduct,
    setFilters,
    setPagination,
    setError,
  };
};

// Optional: Toast hook (if you don't have one)
// frontend/src/hooks/useToast.js
export const useToast = () => {
  // Replace with your actual toast implementation
  // Example using react-hot-toast or similar
  return {
    success: (message) => console.log("✅", message),
    error: (message) => console.log("❌", message),
    info: (message) => console.log("ℹ️", message),
    warning: (message) => console.log("⚠️", message),
  };
};

export { useProducts }