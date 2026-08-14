// frontend/src/Admin/pages/AdminProducts.jsx
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, 
  FiDownload, FiEye, FiPackage, FiDollarSign, 
  FiAlertTriangle, FiImage, FiRefreshCw,
  FiChevronLeft, FiChevronRight, FiGrid, FiList,
  FiCheck
} from "react-icons/fi";
import { productApi } from "../../api";

const AdminProducts = () => {
  const queryClient = useQueryClient();

  // ========== STATE ==========
  const [viewMode, setViewMode] = useState("table");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters
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

  // Modals
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const [statusModal, setStatusModal] = useState({ show: false, id: null, status: "" });
  const [stockModal, setStockModal] = useState({ show: false, id: null, quantity: 0, operation: "set" });

  // ========== QUERIES ==========
  const {
    data: productsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-products", currentPage, limit, filters],
    queryFn: () => productApi.getProducts({
      page: currentPage,
      limit,
      sort: filters.sort,
      ...(filters.search && { search: filters.search }),
      ...(filters.category && { category: filters.category }),
      ...(filters.status && { status: filters.status }),
      ...(filters.brand && { brand: filters.brand }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
      ...(filters.inStock && { inStock: filters.inStock }),
      ...(filters.isFeatured && { isFeatured: filters.isFeatured }),
    }).then(res => res.data),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });

  const products = productsData?.data || [];
  const totalProducts = productsData?.total || 0;
  const totalPages = productsData?.pagination?.totalPages || 1;

  // ========== MUTATIONS ==========

  // Delete single product
  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.permanentDelete(id),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries(["admin-products"]);
      setDeleteModal({ show: false, id: null });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });

  // Bulk delete
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids) => productApi.bulkDelete(ids),
    onSuccess: (data) => {
      toast.success(data.message || "Products deleted successfully");
      setSelectedProducts([]);
      setSelectAll(false);
      queryClient.invalidateQueries(["admin-products"]);
      setBulkDeleteModal(false);
    },
    onError: (error) => {
      toast.error("Failed to delete products");
    },
  });

  // Update status
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => productApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success("Status updated");
      queryClient.invalidateQueries(["admin-products"]);
      setStatusModal({ show: false, id: null, status: "" });
    },
    onError: (error) => {
      toast.error("Failed to update status");
    },
  });

  // Update stock
  const stockMutation = useMutation({
    mutationFn: ({ id, data }) => productApi.updateStock(id, data),
    onSuccess: () => {
      toast.success("Stock updated");
      queryClient.invalidateQueries(["admin-products"]);
      setStockModal({ show: false, id: null, quantity: 0, operation: "set" });
    },
    onError: (error) => {
      toast.error("Failed to update stock");
    },
  });

  // Toggle featured
  const featuredMutation = useMutation({
    mutationFn: (id) => productApi.toggleFeatured(id),
    onSuccess: () => {
      toast.success("Featured status updated");
      queryClient.invalidateQueries(["admin-products"]);
    },
  });

  // Bulk status update
  const bulkStatusMutation = useMutation({
    mutationFn: ({ ids, status }) => productApi.bulkUpdate({ productIds: ids, updates: { status } }),
    onSuccess: () => {
      toast.success("Products updated");
      setSelectedProducts([]);
      setSelectAll(false);
      queryClient.invalidateQueries(["admin-products"]);
    },
  });

  // ========== HANDLERS ==========

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "", category: "", status: "", brand: "",
      minPrice: "", maxPrice: "", inStock: "", isFeatured: "",
      sort: "-createdAt",
    });
    setCurrentPage(1);
  };

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    setSelectedProducts(checked ? products.map(p => p._id) : []);
  };

  const handleSelect = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Export CSV
  const handleExport = () => {
    if (products.length === 0) {
      toast.error("No products to export");
      return;
    }
    const csvContent = [
      ["Name", "SKU", "Price", "Quantity", "Status", "Category", "Sales"],
      ...products.map(p => [
        `"${p.name}"`,
        p.sku || "N/A",
        p.price,
        p.quantity,
        p.status,
        p.category?.name || "N/A",
        p.totalSold || 0,
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Products exported!");
  };

  // ========== COMPUTED STATS ==========
  const stats = {
    total: totalProducts,
    active: products.filter(p => p.status === "active").length,
    outOfStock: products.filter(p => p.quantity === 0).length,
    lowStock: products.filter(p => p.quantity > 0 && p.quantity <= 5).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
  };

  // ========== STATUS BADGE ==========
  const StatusBadge = ({ status }) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-300",
      inactive: "bg-gray-100 text-gray-800 border-gray-300",
      draft: "bg-yellow-100 text-yellow-800 border-yellow-300",
      outOfStock: "bg-red-100 text-red-800 border-red-300",
      discontinued: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.inactive}`}>
        {status === "outOfStock" ? "Out of Stock" : status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // ========== LOADING SKELETON ==========
  const TableSkeleton = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-8 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 animate-pulse">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
            <div className="w-24 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-sm text-gray-500 mt-1">
                {totalProducts} products total · {stats.active} active · {stats.lowStock} low stock
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin/products/create"
                className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                <FiPlus className="mr-2" />
                Add Product
              </Link>
              <button
                onClick={handleExport}
                disabled={products.length === 0}
                className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm disabled:opacity-50"
              >
                <FiDownload className="mr-2" />
                Export
              </button>
              <button
                onClick={() => setViewMode(v => v === "table" ? "grid" : "table")}
                className="p-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                title={viewMode === "table" ? "Grid View" : "Table View"}
              >
                {viewMode === "table" ? <FiGrid size={18} /> : <FiList size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: FiPackage, color: "blue" },
            { label: "Active", value: stats.active, icon: FiCheck, color: "green" },
            { label: "Low Stock", value: stats.lowStock, icon: FiAlertTriangle, color: "yellow" },
            { label: "Value", value: `₹${(stats.totalValue / 1000).toFixed(1)}K`, icon: FiDollarSign, color: "purple" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 shadow-sm ring-1 ring-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-${color}-100 rounded-lg`}>
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="p-4 border-b bg-gray-50/50">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" size={18} />
              <h2 className="font-semibold text-gray-700">Filters</h2>
            </div>
          </div>
          <div className="p-4">
            <form onSubmit={handleSearch} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                  />
                </div>
                <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="inactive">Inactive</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
                <select value={filters.inStock} onChange={(e) => handleFilterChange("inStock", e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="">All Stock</option>
                  <option value="true">In Stock</option>
                </select>
                <select value={filters.sort} onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm">
                  <option value="-createdAt">Newest</option>
                  <option value="createdAt">Oldest</option>
                  <option value="price">Price: Low→High</option>
                  <option value="-price">Price: High→Low</option>
                  <option value="-totalSold">Best Selling</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition">
                  Apply
                </button>
                <button type="button" onClick={clearFilters} className="px-4 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition flex items-center gap-1">
                  <FiRefreshCw size={14} /> Reset
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedProducts.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-blue-800 text-sm font-medium">
              {selectedProducts.length} product(s) selected
            </p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => bulkStatusMutation.mutate({ ids: selectedProducts, status: "active" })}
                className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 transition font-medium">
                Set Active
              </button>
              <button onClick={() => bulkStatusMutation.mutate({ ids: selectedProducts, status: "draft" })}
                className="px-3 py-1.5 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700 transition font-medium">
                Set Draft
              </button>
              <button onClick={() => setBulkDeleteModal(true)}
                className="px-3 py-1.5 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition font-medium">
                <FiTrash2 className="inline mr-1" size={14} /> Delete
              </button>
              <button onClick={() => { setSelectedProducts([]); setSelectAll(false); }}
                className="px-3 py-1.5 bg-white border border-gray-300 text-gray-600 text-xs rounded-lg hover:bg-gray-50 transition">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <TableSkeleton />
        ) : isError ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FiAlertTriangle className="mx-auto text-red-400 mb-3" size={40} />
            <p className="text-red-600 font-medium mb-2">Failed to load products</p>
            <p className="text-gray-500 text-sm mb-4">{error?.message}</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Try Again
            </button>
          </div>
        ) : viewMode === "table" ? (
          /* ===== TABLE VIEW ===== */
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-10 px-4 py-3">
                      <input type="checkbox" checked={selectAll}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Stock</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Sales</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-4 py-16 text-center">
                        <FiPackage className="mx-auto text-gray-300 mb-3" size={40} />
                        <p className="text-gray-500 font-medium">No products found</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedProducts.includes(product._id)}
                            onChange={() => handleSelect(product._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <FiImage className="text-gray-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <Link to={`/admin/products/${product._id}/edit`} className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate block max-w-50">
                                {product.name}
                              </Link>
                              <p className="text-xs text-gray-500">{product.category?.name || "—"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden md:table-cell font-mono">
                          {product.sku || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-semibold">₹{product.price?.toLocaleString()}</p>
                          {product.compareAtPrice > product.price && (
                            <p className="text-xs text-gray-400 line-through">₹{product.compareAtPrice?.toLocaleString()}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setStockModal({ show: true, id: product._id, quantity: product.quantity, operation: "set" })}
                            className={`text-sm font-semibold hover:underline ${
                              product.quantity === 0 ? "text-red-600" : product.quantity <= 5 ? "text-amber-600" : "text-green-600"
                            }`}>
                            {product.quantity}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setStatusModal({ show: true, id: product._id, status: product.status })}>
                            <StatusBadge status={product.status} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                          {product.totalSold || 0}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/admin/products/${product._id}/edit`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                              <FiEdit2 size={16} />
                            </Link>
                            <Link to={`/product/${product._id}`} target="_blank"
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition" title="View">
                              <FiEye size={16} />
                            </Link>
                            <button onClick={() => setDeleteModal({ show: true, id: product._id })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete">
                              <FiTrash2 size={16} />
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
          /* ===== GRID VIEW ===== */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <FiPackage className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 font-medium">No products found</p>
              </div>
            ) : (
              products.map((product) => (
                <div key={product._id} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden hover:shadow-md transition group">
                  <div className="relative aspect-square bg-gray-100">
                    {product.images?.[0]?.url ? (
                      <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiImage className="text-gray-300" size={48} />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      <input type="checkbox" checked={selectedProducts.includes(product._id)}
                        onChange={() => handleSelect(product._id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white/90" />
                    </div>
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={product.status} />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-lg font-bold">₹{product.price?.toLocaleString()}</span>
                      <span className={`text-sm ${product.quantity === 0 ? "text-red-500" : "text-gray-500"}`}>
                        {product.quantity} in stock
                      </span>
                    </div>
                    <div className="flex justify-end gap-1 mt-3 pt-3 border-t">
                      <Link to={`/admin/products/${product._id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <FiEdit2 size={16} />
                      </Link>
                      <button onClick={() => setDeleteModal({ show: true, id: product._id })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{((currentPage - 1) * limit) + 1}</span>–
              <span className="font-semibold">{Math.min(currentPage * limit, totalProducts)}</span> of{" "}
              <span className="font-semibold">{totalProducts}</span>
            </p>
            <div className="flex items-center gap-2">
              <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1.5 border rounded-lg text-sm">
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30">
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) pageNum = i + 1;
                else if (currentPage <= 3) pageNum = i + 1;
                else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                else pageNum = currentPage - 2 + i;
                return (
                  <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                      currentPage === pageNum ? "bg-blue-600 text-white" : "hover:bg-gray-100"
                    }`}>
                    {pageNum}
                  </button>
                );
              })}
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-30">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========== MODALS ========== */}

      {/* Delete Modal */}
      {deleteModal.show && (
        <Modal onClose={() => setDeleteModal({ show: false, id: null })}>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Delete Product?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteModal({ show: false, id: null })}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
              <button onClick={() => deleteMutation.mutate(deleteModal.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50">
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Delete Modal */}
      {bulkDeleteModal && (
        <Modal onClose={() => setBulkDeleteModal(false)}>
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiAlertTriangle className="text-red-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-2">Delete {selectedProducts.length} Products?</h3>
            <p className="text-gray-500 text-sm mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setBulkDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
              <button onClick={() => bulkDeleteMutation.mutate(selectedProducts)}
                disabled={bulkDeleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50">
                {bulkDeleteMutation.isPending ? "Deleting..." : `Delete ${selectedProducts.length}`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Status Modal */}
      {statusModal.show && (
        <Modal onClose={() => setStatusModal({ show: false, id: null, status: "" })}>
          <h3 className="text-lg font-semibold mb-4">Update Status</h3>
          <select value={statusModal.status} onChange={(e) => setStatusModal(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-4 py-2.5 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="outOfStock">Out of Stock</option>
            <option value="discontinued">Discontinued</option>
          </select>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setStatusModal({ show: false, id: null, status: "" })}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Cancel</button>
            <button onClick={() => statusMutation.mutate({ id: statusModal.id, status: statusModal.status })}
              disabled={statusMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
              {statusMutation.isPending ? "Updating..." : "Update"}
            </button>
          </div>
        </Modal>
      )}

      {/* Stock Modal */}
      {stockModal.show && (
        <Modal onClose={() => setStockModal({ show: false, id: null, quantity: 0, operation: "set" })}>
          <h3 className="text-lg font-semibold mb-4">Update Stock</h3>
          <select value={stockModal.operation} onChange={(e) => setStockModal(prev => ({ ...prev, operation: e.target.value }))}
            className="w-full px-4 py-2.5 border rounded-lg mb-3">
            <option value="set">Set Exact Quantity</option>
            <option value="add">Add to Stock</option>
            <option value="subtract">Remove from Stock</option>
          </select>
          <input type="number" min="0" value={stockModal.quantity}
            onChange={(e) => setStockModal(prev => ({ ...prev, quantity: Math.max(0, parseInt(e.target.value) || 0) }))}
            className="w-full px-4 py-2.5 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setStockModal({ show: false, id: null, quantity: 0, operation: "set" })}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm">Cancel</button>
            <button onClick={() => stockMutation.mutate({ id: stockModal.id, data: { quantity: stockModal.quantity, operation: stockModal.operation } })}
              disabled={stockMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50">
              {stockMutation.isPending ? "Updating..." : "Update"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ========== MODAL COMPONENT ==========
const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="fixed inset-0 bg-black/50" />
    <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md z-10" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

export default AdminProducts;