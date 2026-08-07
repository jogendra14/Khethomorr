// frontend/src/components/products/Products.jsx

import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ✅ Import your API functions instead of raw axios
import { 
  getAllProducts, 
  getProductTypes, 
  deleteProduct 
} from "../../api/productApi"; // Check path: if file is inside src folder, use './productAPI'

// Custom debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Products = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. UI State
  const [filters, setFilters] = useState({
    search: "",
    productType: "",
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    inStock: "",
  });

  // Separate state for search input to implement debounce
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  // Update filters.search when debounced value changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
    setCurrentPage(1); // ✅ Reset to page 1 when search changes
  }, [debouncedSearch]);

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Stabilize filters to prevent unnecessary re-renders and API calls
  const stableFilters = useMemo(
    () => ({
      search: filters.search,
      productType: filters.productType,
      category: filters.category,
      brand: filters.brand,
      minPrice: filters.minPrice ? Number(filters.minPrice) : "",
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : "",
      inStock: filters.inStock,
    }),
    [filters.search, filters.productType, filters.category, filters.brand, filters.minPrice, filters.maxPrice, filters.inStock],
  );

  // ✅ 2. React Query Hooks - Using the API functions
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['products', stableFilters, sortBy, sortOrder, currentPage],
    queryFn: () => getAllProducts({
      page: currentPage,
      limit: 20,
      search: stableFilters.search,
      productType: stableFilters.productType,
      category: stableFilters.category,
      brand: stableFilters.brand,
      minPrice: stableFilters.minPrice,
      maxPrice: stableFilters.maxPrice,
      inStock: stableFilters.inStock,
      sortBy,
      sortOrder,
    }),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch product types
  const { data: productTypesData, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['productTypes'],
    queryFn: getProductTypes,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
  
  const productTypes = productTypesData?.types || [];

  // ✅ Delete mutation - Using imported deleteProduct
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete product');
    },
  });

  // 3. Derived Data
  const products = useMemo(() => {
    return data?.products || [];
  }, [data]);

  const totalProducts = useMemo(() => {
    return data?.pagination?.totalProducts || 0;
  }, [data]);

  const totalPages = useMemo(() => {
    return data?.pagination?.totalPages || 1;
  }, [data]);

  // 4. Selection Management
  const handleSelectAll = useCallback(
    (e) => {
      if (e.target.checked) {
        setSelectedProducts(products.map((p) => p._id));
      } else {
        setSelectedProducts([]);
      }
    },
    [products],
  );

  const handleSelect = useCallback((productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  // 5. Delete Handlers
  const handleDeleteClick = useCallback(
    (product) => {
      if (!product || !product._id) {
        toast.error("Invalid product");
        return;
      }

      if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
        deleteMutation.mutate(product._id, {
          onSuccess: () => {
            setSelectedProducts((prev) => prev.filter((id) => id !== product._id));
          },
        });
      }
    },
    [deleteMutation],
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products to delete");
      return;
    }

    if (!window.confirm(`Delete ${selectedProducts.length} products?`)) {
      return;
    }

    try {
      await Promise.all(selectedProducts.map((id) => deleteMutation.mutateAsync(id)));
      toast.success(`${selectedProducts.length} products deleted successfully`);
      setSelectedProducts([]);
    } catch (error) {
      toast.error(error?.message || "Failed to delete some products");
    }
  }, [selectedProducts, deleteMutation]);

  // 6. Filter Handlers
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;

    // Handle search input separately for debounce
    if (name === "search") {
      setSearchInput(value);
      return;
    }

    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      productType: "",
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      inStock: "",
    });
    setSearchInput("");
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((e) => {
    const [newSortBy, newSortOrder] = e.target.value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // Reset to first page when sort changes
  }, []);

  // 7. Pagination Handlers
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);

  // 8. Utility Functions
  const formatPrice = useCallback((price) => {
    if (!price && price !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  }, []);

  const getStockStatus = useCallback((stock) => {
    if (stock === undefined || stock === null) {
      return { text: "Unknown", color: "bg-gray-100 text-gray-800" };
    }
    if (stock > 50) return { text: "In Stock", color: "bg-green-100 text-green-800" };
    if (stock > 0) return { text: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Out of Stock", color: "bg-red-100 text-red-800" };
  }, []);

  const handleImageError = useCallback((e) => {
    e.target.src = "/placeholder.png";
  }, []);

  // 9. Render Functions
  const renderLoadingState = () => (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Products</h3>
      <p className="mt-1 text-gray-500">{error?.message || "Something went wrong"}</p>
      <button 
        onClick={() => refetch()} 
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">No Products Found</h3>
      <p className="mt-1 text-gray-500">
        {filters.search || filters.productType || filters.minPrice ? "Try adjusting your filters" : "Get started by creating a new product"}
      </p>
      {!filters.search && !filters.productType && !filters.minPrice && (
        <button 
          onClick={() => navigate("/add-product")} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Add Your First Product
        </button>
      )}
    </div>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className="px-3 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Previous
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50 transition-colors"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-3 py-2 border rounded-md text-sm transition-colors ${
              currentPage === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50 transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  const renderProductCard = useCallback(
    (product) => {
      const stockStatus = getStockStatus(product.stock);
      const isSelected = selectedProducts.includes(product._id);

      return (
        <div key={product._id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
          <div className="relative">
            <img
              src={product.images?.[0] || "/placeholder.png"}
              alt={product.name || "Product"}
              className="w-full h-48 object-cover rounded-t-lg"
              onError={handleImageError}
              loading="lazy"
            />

            <div className="absolute top-2 left-2">
              <input 
                type="checkbox" 
                checked={isSelected} 
                onChange={() => handleSelect(product._id)} 
                className="w-4 h-4 text-blue-600 rounded" 
              />
            </div>

            {product.discount > 0 && (
              <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                {product.discount}% OFF
              </div>
            )}

            {product.productType && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs capitalize">
                {product.productType}
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-1 truncate">{product.name || "Unnamed Product"}</h3>

            <p className="text-sm text-gray-600 mb-2 truncate">
              {product.brand && `${product.brand} • `}
              {product.category || "Uncategorized"}
            </p>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold text-gray-800">{formatPrice(product.sellingPrice)}</span>
              {product.MRP > product.sellingPrice && (
                <span className="text-sm text-gray-500 line-through">{formatPrice(product.MRP)}</span>
              )}
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                {stockStatus.text}
              </span>

              {product.rating > 0 && (
                <span className="flex items-center text-sm text-yellow-500">
                  ★ {product.rating.toFixed(1)}
                  <span className="text-gray-400 ml-1">({product.reviews || 0})</span>
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Link
                to={`/products/${product._id}`}
                className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm transition-colors"
              >
                View
              </Link>
              <Link
                to={`/edit-product/${product._id}`}
                className="flex-1 text-center px-3 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-sm transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDeleteClick(product)}
                className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      );
    },
    [selectedProducts, handleSelect, handleDeleteClick, formatPrice, getStockStatus, handleImageError],
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => renderProductCard(product))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-10 p-3">
                <input
                  type="checkbox"
                  checked={products.length > 0 && selectedProducts.length === products.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-600">Product</th>
              <th className="p-3 text-left text-sm font-medium text-gray-600">Type</th>
              <th className="p-3 text-left text-sm font-medium text-gray-600">Price</th>
              <th className="p-3 text-left text-sm font-medium text-gray-600">Stock</th>
              <th className="p-3 text-left text-sm font-medium text-gray-600">Rating</th>
              <th className="p-3 text-left text-sm font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => {
              const stockStatus = getStockStatus(product.stock);
              const isSelected = selectedProducts.includes(product._id);

              return (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => handleSelect(product._id)} 
                      className="w-4 h-4 text-blue-600 rounded" 
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || "/placeholder.png"}
                        alt={product.name || "Product"}
                        className="w-12 h-12 object-cover rounded-md"
                        onError={handleImageError}
                        loading="lazy"
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">{product.name || "Unnamed"}</h4>
                        <p className="text-sm text-gray-500">
                          {product.brand && `${product.brand} • `}
                          {product.category || "Uncategorized"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-md text-xs capitalize">
                      {product.productType || "N/A"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div>
                      <span className="font-medium">{formatPrice(product.sellingPrice)}</span>
                      {product.discount > 0 && (
                        <span className="ml-2 text-xs text-green-600">-{product.discount}%</span>
                      )}
                    </div>
                    {product.MRP > product.sellingPrice && (
                      <span className="text-sm text-gray-400 line-through">{formatPrice(product.MRP)}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.text} ({product.stock || 0})
                    </span>
                  </td>
                  <td className="p-3">
                    {product.rating > 0 ? (
                      <span className="text-yellow-500">★ {product.rating.toFixed(1)}</span>
                    ) : (
                      <span className="text-gray-400">No rating</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link 
                        to={`/products/${product._id}`} 
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        to={`/edit-product/${product._id}`}
                        className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 10. Main Render
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-600 mt-1">
            Showing {products.length} of {totalProducts} products
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Selected ({selectedProducts.length})
            </button>
          )}

          <Link 
            to="/add-product" // ✅ Fixed typo: changed "add-Product" to "/add-product"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search with Debounce */}
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={searchInput}
              onChange={handleFilterChange}
              placeholder="Search by name, brand..."
              className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Product Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Type</label>
            <select
              name="productType"
              value={filters.productType}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Types</option>
              {productTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium mb-1">Min Price</label>
            <input
              type="number"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="₹ Min"
              min="0"
              className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Max Price</label>
            <input
              type="number"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="₹ Max"
              min="0"
              className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Stock Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Stock Status</label>
            <select
              name="inStock"
              value={filters.inStock}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All</option>
              <option value="true">In Stock</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-1">Sort By</label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={handleSortChange}
              className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="sellingPrice-asc">Price: Low to High</option>
              <option value="sellingPrice-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="stock-desc">Stock: High to Low</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button 
              onClick={clearFilters} 
              className="w-full p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm"
            >
              Clear Filters
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Select All Checkbox */}
      {products.length > 0 && !isLoading && (
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={products.length > 0 && selectedProducts.length === products.length}
            onChange={handleSelectAll}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label className="text-sm text-gray-700">Select All ({products.length} products)</label>
        </div>
      )}

      {/* Main Content */}
      {isLoading && renderLoadingState()}

      {isError && !isLoading && renderErrorState()}

      {!isLoading && !isError && products.length === 0 && renderEmptyState()}

      {!isLoading && !isError && products.length > 0 && (
        <>
          {viewMode === "grid" ? renderGridView() : renderListView()}
          
          {/* Pagination */}
          {renderPagination()}

          {/* Showing info */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalProducts)} of {totalProducts} products
          </div>
        </>
      )}
    </div>
  );
};

export default Products;