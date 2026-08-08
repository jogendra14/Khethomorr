// frontend/src/pages/admin/Products.jsx
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, 
  FiDownload, FiUpload, FiEye, FiEyeOff, FiStar,
  FiPackage, FiDollarSign, FiBarChart2, FiRefreshCw,
  FiChevronLeft, FiChevronRight, FiX, FiCheck,
  FiAlertTriangle, FiImage, FiTag, FiGrid, FiList
} from "react-icons/fi";
import ProductAPI from "../../api/productApi";

const AdminProducts = () => {
  // State Management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("table"); // table or grid
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [limit, setLimit] = useState(10);

  // Filter State
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    brand: "",
    minPrice: "",
    maxPrice: "",
    inStock: "",
    isFeatured: "",
    sort: "-createdAt",
  });

  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusProductId, setStatusProductId] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProductId, setStockProductId] = useState(null);
  const [stockData, setStockData] = useState({ quantity: 0, operation: "set" });

  // Stats State
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStock: 0,
    totalValue: 0,
  });

  // ============================================
  // FETCH PRODUCTS
  // ============================================
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {
        page: currentPage,
        limit,
        sort: filters.sort,
      };

      // Add filters if they have values
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;
      if (filters.brand) params.brand = filters.brand;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.inStock) params.inStock = filters.inStock;
      if (filters.isFeatured) params.isFeatured = filters.isFeatured;

      const response = await ProductAPI.getFilteredProducts(params);
      
      setProducts(response.data);
      setTotalPages(response.totalPages);
      setTotalProducts(response.totalProducts);
      
      // Update stats
      if (response.data) {
        const active = response.data.filter(p => p.status === "active").length;
        const outOfStock = response.data.filter(p => p.status === "outOfStock").length;
        const totalValue = response.data.reduce((sum, p) => sum + (p.price * p.quantity), 0);
        
        setStats({
          totalProducts: response.totalProducts,
          activeProducts: active,
          outOfStock: outOfStock,
          totalValue: totalValue,
        });
      }
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch products");
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ============================================
  // HANDLERS
  // ============================================

  // Handle Search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  // Handle Filter Change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Clear Filters
  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "",
      brand: "",
      minPrice: "",
      maxPrice: "",
      inStock: "",
      isFeatured: "",
      sort: "-createdAt",
    });
    setCurrentPage(1);
  };

  // Handle Select All
  const handleSelectAll = (e) => {
    setSelectAll(e.target.checked);
    if (e.target.checked) {
      setSelectedProducts(products.map(p => p._id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Handle Single Select
  const handleSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  // Handle Delete Single Product
  const handleDeleteClick = (productId) => {
    setDeleteProductId(productId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await ProductAPI.deleteProduct(deleteProductId);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete product");
    } finally {
      setShowDeleteModal(false);
      setDeleteProductId(null);
    }
  };

  // Handle Bulk Delete
  const handleBulkDelete = async () => {
    try {
      await ProductAPI.bulkDeleteProducts(selectedProducts);
      toast.success(`${selectedProducts.length} products deleted successfully`);
      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts();
    } catch (error) {
      toast.error("Failed to delete products");
    } finally {
      setShowBulkDeleteModal(false);
    }
  };

  // Handle Status Change
  const handleStatusClick = (productId, currentStatus) => {
    setStatusProductId(productId);
    setNewStatus(currentStatus);
    setShowStatusModal(true);
  };

  const confirmStatusChange = async () => {
    try {
      await ProductAPI.updateProductStatus(statusProductId, newStatus);
      toast.success("Product status updated");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setShowStatusModal(false);
      setStatusProductId(null);
    }
  };

  // Handle Stock Update
  const handleStockClick = (productId, currentQuantity) => {
    setStockProductId(productId);
    setStockData({ quantity: currentQuantity, operation: "set" });
    setShowStockModal(true);
  };

  const confirmStockUpdate = async () => {
    try {
      await ProductAPI.updateProductStock(stockProductId, stockData);
      toast.success("Stock updated successfully");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update stock");
    } finally {
      setShowStockModal(false);
      setStockProductId(null);
    }
  };

  // Handle Bulk Status Change
  const handleBulkStatusChange = async (status) => {
    try {
      await ProductAPI.bulkUpdateProducts(selectedProducts, { status });
      toast.success(`Status updated for ${selectedProducts.length} products`);
      setSelectedProducts([]);
      setSelectAll(false);
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update products");
    }
  };

  // Handle Export (Simple CSV)
  const handleExport = () => {
    const csvContent = [
      ["Name", "SKU", "Price", "Quantity", "Status", "Category"],
      ...products.map(p => [
        p.name,
        p.sku || "N/A",
        p.price,
        p.quantity,
        p.status,
        p.category?.name || "N/A"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Products exported successfully");
  };

  // Status Badge Component
  const StatusBadge = ({ status }) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800 border-green-300",
      inactive: "bg-gray-100 text-gray-800 border-gray-300",
      draft: "bg-yellow-100 text-yellow-800 border-yellow-300",
      outOfStock: "bg-red-100 text-red-800 border-red-300",
      discontinued: "bg-purple-100 text-purple-800 border-purple-300",
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || statusStyles.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your products, inventory, and listings
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/products/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Add Product
              </Link>
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiDownload className="mr-2" />
                Export
              </button>
              <button
                onClick={() => setViewMode(viewMode === "table" ? "grid" : "table")}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                title={viewMode === "table" ? "Switch to Grid View" : "Switch to Table View"}
              >
                {viewMode === "table" ? <FiGrid /> : <FiList />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiPackage className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Products</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeProducts}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inventory Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{stats.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiDollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <h2 className="text-lg font-semibold">Filters</h2>
            </div>
          </div>
          <div className="p-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                  <option value="outOfStock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>

                {/* Stock Filter */}
                <select
                  value={filters.inStock}
                  onChange={(e) => handleFilterChange("inStock", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Stock</option>
                  <option value="true">In Stock</option>
                  <option value="false">Out of Stock</option>
                </select>

                {/* Sort */}
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="price">Price: Low to High</option>
                  <option value="-price">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="-name">Name: Z to A</option>
                  <option value="-totalSold">Best Selling</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Min Price */}
                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Max Price */}
                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Featured Filter */}
                <select
                  value={filters.isFeatured}
                  onChange={(e) => handleFilterChange("isFeatured", e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Products</option>
                  <option value="true">Featured</option>
                  <option value="false">Not Featured</option>
                </select>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Apply Filters
                  </button>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <FiRefreshCw />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <p className="text-blue-800">
                <span className="font-semibold">{selectedProducts.length}</span> products selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkStatusChange("active")}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleBulkStatusChange("draft")}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                >
                  Mark Draft
                </button>
                <button
                  onClick={() => setShowBulkDeleteModal(true)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                >
                  <FiTrash2 className="inline mr-1" />
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Table/Grid */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading products...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center text-red-600">
              <p>{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => handleSelect(product._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {product.images && product.images[0] ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="h-10 w-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                  <FiImage className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {product.category?.name || "No Category"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {product.sku || "N/A"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            ₹{product.price?.toLocaleString()}
                          </div>
                          {product.compareAtPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              ₹{product.compareAtPrice?.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleStockClick(product._id, product.quantity)}
                            className={`text-sm font-medium ${
                              product.quantity === 0
                                ? "text-red-600"
                                : product.quantity <= 5
                                ? "text-yellow-600"
                                : "text-green-600"
                            } hover:underline`}
                          >
                            {product.quantity}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleStatusClick(product._id, product.status)}
                          >
                            <StatusBadge status={product.status} />
                          </button>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {product.totalSold || 0}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/admin/products/${product._id}/edit`}
                              className="text-blue-600  hover:text-blue-900 p-1"
                              title="Edit"
                            >
                              <FiEdit2 />
                            </Link>
                            <Link
                              to={`/product/${product.slug || product._id}`}
                              target="_blank"
                              className="text-green-600 hover:text-green-900 p-1"
                              title="View"
                            >
                              <FiEye />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(product._id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="relative">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <FiImage className="text-gray-400 text-4xl" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product._id)}
                      onChange={() => handleSelect(product._id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white"
                    />
                  </div>
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={product.status} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.price?.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.quantity}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FiEdit2 />
                    </Link>
                    <Link
                      to={`/product/${product.slug || product._id}`}
                      target="_blank"
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                    >
                      <FiEye />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(product._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow mt-6 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * limit, totalProducts)}
                </span>{" "}
                of <span className="font-medium">{totalProducts}</span> results
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronLeft />
                  </button>
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show limited page numbers
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 border rounded ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      pageNum === currentPage - 2 ||
                      pageNum === currentPage + 2
                    ) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Delete Product</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <FiAlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Delete Multiple Products</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedProducts.length} products? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete {selectedProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Product Status</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {showStockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Stock</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operation
              </label>
              <select
                value={stockData.operation}
                onChange={(e) =>
                  setStockData({ ...stockData, operation: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
              >
                <option value="set">Set Exact Quantity</option>
                <option value="add">Add to Stock</option>
                <option value="subtract">Remove from Stock</option>
              </select>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={stockData.quantity}
                onChange={(e) =>
                  setStockData({ ...stockData, quantity: Number(e.target.value) })
                }
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStockModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmStockUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;