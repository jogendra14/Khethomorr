// frontend/src/components/products/Products.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useProducts, useDeleteProduct } from "../../hooks/useProducts"; // 👈 Import your hooks
import { useProductTypes } from "../../hooks/useProducts"; // Assuming you make a hook, or keep existing fetch

const Products = () => {
  const navigate = useNavigate();
 const [filters, setFilters] = useState({
    search: "",
    productType: "",
    category: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    inStock: "",
  });  // State
   const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [productTypes, setProductTypes] = useState([]);

    // 3. 🚀 REACT QUERY: Fetch Products with Infinite Scroll
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useProducts(filters); // Filters pass kiye

    const products = data?.pages?.flatMap((page) => page.products) || [];
  const totalProducts = data?.pages?.[data.pages.length - 1]?.pagination?.totalProducts || 0;
  const deleteMutation = useDeleteProduct();

  const handleDeleteClick = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(productId, {
        onSuccess: () => {
          toast.success("Product deleted successfully");
          setSelectedProducts(prev => prev.filter(id => id !== productId));
        },
      });
    }
  };

   // Bulk Delete (Similar logic)
  const handleBulkDeleteClick = () => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products to delete");
      return;
    }
    if (window.confirm(`Delete ${selectedProducts.length} products?`)) {
      // Use Promise.all for bulk or your existing bulkDeleteProducts API
      Promise.all(selectedProducts.map(id => deleteMutation.mutateAsync(id)))
        .then(() => {
          toast.success(`${selectedProducts.length} products deleted`);
          setSelectedProducts([]);
          setSelectAll(false);
        })
        .catch(() => toast.error("Failed to delete some products"));
    }
  };

   // Handle Filter Change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Clear Filters
  const clearFilters = () => {
    setFilters({
      search: "",
      productType: "",
      category: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      inStock: "",
    });
  };

   // Handle Select All
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(products.map((p) => p._id));
      setSelectAll(true);
    } else {
      setSelectedProducts([]);
      setSelectAll(false);
    }
  };

  // Handle Single Select
  const handleSelect = (productId) => {
    setSelectedProducts((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Format Price & Stock Status (Same as before)
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(price);
  };
  const getStockStatus = (stock) => {
    if (stock > 50) return { text: "In Stock", color: "bg-green-100 text-green-800" };
    if (stock > 0) return { text: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { text: "Out of Stock", color: "bg-red-100 text-red-800" };
  };

  // Confirm Delete
  const confirmDelete = async () => {
    try {
      if (deleteTarget.type === "single") {
        await deleteProduct(deleteTarget.product._id);
        toast.success("Product deleted successfully");
      } else if (deleteTarget.type === "bulk") {
        await bulkDeleteProducts(deleteTarget.ids);
        toast.success(`${deleteTarget.ids.length} products deleted successfully`);
        setSelectedProducts([]);
        setSelectAll(false);
      }

      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.message || "Failed to delete");
    }
  };


  // Handle Sort
  const handleSortChange = (e) => {
    const [newSortBy, newSortOrder] = e.target.value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };


  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-600 mt-1">
            Total {pagination.totalProducts} products found
          </p>
        </div>

        <div className="flex gap-3">
          {selectedProducts.length > 0 && (
            <button
              onClick={handleBulkDeleteClick}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected ({selectedProducts.length})
            </button>
          )}

          <button
            onClick={() => navigate("add-product")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium mb-1">Search</label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Search by name, brand..."
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>

          {/* Product Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Type</label>
            <select
              name="productType"
              value={filters.productType}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md text-sm"
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
              className="w-full p-2 border rounded-md text-sm"
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
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>

          {/* Stock Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Stock Status</label>
            <select
              name="inStock"
              value={filters.inStock}
              onChange={handleFilterChange}
              className="w-full p-2 border rounded-md text-sm"
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
              className="w-full p-2 border rounded-md text-sm"
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
              className="w-full p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
            >
              Clear Filters
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md ${
                viewMode === "grid"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
              title="Grid View"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 8a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zm6-6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zm0 8a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
              title="List View"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Select All Checkbox */}
      {products.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label className="text-sm text-gray-700">Select All</label>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Error Loading Products</h3>
          <p className="mt-1 text-gray-500">{error}</p>
          <button
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Products Found</h3>
          <p className="mt-1 text-gray-500">
            {filters.search || filters.productType || filters.minPrice
              ? "Try adjusting your filters"
              : "Get started by creating a new product"}
          </p>
          {!filters.search && !filters.productType && !filters.minPrice && (
            <button
              onClick={() => navigate("/products/add")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Your First Product
            </button>
          )}
        </div>
      )}

      {/* Grid View */}
      {!loading && !error && viewMode === "grid" && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const stockStatus = getStockStatus(product.stock);
            return (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="relative">
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.src = "/placeholder.png";
                    }}
                  />
                  
                  {/* Select Checkbox */}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleSelect(product._id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </div>

                  {/* Discount Badge */}
                  {product.discount > 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-bold">
                      {product.discount}% OFF
                    </div>
                  )}

                  {/* Product Type Badge */}
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md text-xs">
                    {product.productType}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1 truncate">
                    {product.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-2 truncate">
                    {product.brand && `${product.brand} • `}{product.category}
                  </p>

                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-gray-800">
                      {formatPrice(product.sellingPrice)}
                    </span>
                    {product.MRP > product.sellingPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.MRP)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                    
                    {product.rating > 0 && (
                      <span className="flex items-center text-sm text-yellow-500">
                        ★ {product.rating.toFixed(1)}
                        <span className="text-gray-400 ml-1">({product.reviews})</span>
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 text-center px-3 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-sm"
                    >
                      View
                    </Link>
                    <Link
                      to={`/products/edit/${product._id}`}
                      className="flex-1 text-center px-3 py-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 text-sm"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!loading && !error && viewMode === "list" && products.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-10 p-3">
                  <input
                    type="checkbox"
                    checked={selectAll}
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
                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelect(product._id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded-md"
                          onError={(e) => {
                            e.target.src = "/placeholder.png";
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">{product.name}</h4>
                          <p className="text-sm text-gray-500">{product.brand} • {product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-gray-100 rounded-md text-xs capitalize">
                        {product.productType}
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
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.MRP)}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.text} ({product.stock})
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
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-sm"
                        >
                          View
                        </Link>
                        <Link
                          to={`/products/edit/${product._id}`}
                          className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm"
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
      )}

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6">
          <p className="text-sm text-gray-600">
            Showing {products.length} of {pagination.totalProducts} products
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>

            {[...Array(pagination.totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              // Show limited page numbers
              if (
                pageNumber === 1 ||
                pageNumber === pagination.totalPages ||
                (pageNumber >= pagination.currentPage - 1 &&
                  pageNumber <= pagination.currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 rounded-md ${
                      pagination.currentPage === pageNumber
                        ? "bg-blue-600 text-white"
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === pagination.currentPage - 2 ||
                pageNumber === pagination.currentPage + 2
              ) {
                return <span key={pageNumber} className="px-2 py-2">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            
            {deleteTarget?.type === "single" ? (
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  {deleteTarget.product?.name}
                </span>
                ? This action cannot be undone.
              </p>
            ) : (
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-800">
                  {deleteTarget?.ids?.length} products
                </span>
                ? This action cannot be undone.
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;