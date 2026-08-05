// frontend/src/Admin/pages/Categories.jsx

import { useState, useMemo } from 'react';
import { Search, Plus, Loader2, Edit2, Trash2, Eye } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategoriesWithCounts, deleteCategory, addCategory, updateCategory } from '../../api/category';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Categories = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  // ✅ React Query - Fetch Categories with counts
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategoriesWithCounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    onError: (error) => {
      toast.error(error.message || "Failed to load categories");
    },
  });

  // ✅ React Query - Add Category
  const addCategoryMutation = useMutation({
    mutationFn: addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category added successfully! ✅");
      setShowAddModal(false);
      setCategoryName('');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add category ❌");
    },
  });

  // ✅ React Query - Update Category
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }) => updateCategory(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category updated successfully! ✅");
      setEditingCategory(null);
      setCategoryName('');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category ❌");
    },
  });

  // ✅ React Query - Delete Category
  const deleteCategoryMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Category deleted successfully! 🗑️");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete category ❌");
    },
  });

  // ✅ Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const searchLower = searchTerm.toLowerCase();
    return categories.filter(category =>
      category.name?.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, categories]);

  // ✅ Handle delete category
  const handleDeleteCategory = (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      return;
    }
    deleteCategoryMutation.mutate(id);
  };

  // ✅ Handle add category
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    addCategoryMutation.mutate({ name: categoryName.trim() });
  };

  // ✅ Handle update category
  const handleUpdateCategory = (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }
    updateCategoryMutation.mutate({
      id: editingCategory._id || editingCategory.id,
      name: categoryName.trim(),
    });
  };

  const { isPending: isAdding } = addCategoryMutation;
  const { isPending: isUpdating } = updateCategoryMutation;
  const { isPending: isDeleting } = deleteCategoryMutation;

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mt-1 animate-pulse"></div>
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading categories...</span>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg mb-2">⚠️ Failed to load categories</p>
          <p className="text-red-500 text-sm mb-4">{error?.message || "Please try again"}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all product categories</p>
          {categories.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">Total: {categories.length} categories</p>
          )}
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            setCategoryName('');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search category..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories Grid/List View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Header */}
        {!isLoading && !isError && categories.length > 0 && (
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Image</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2">Products</div>
            <div className="col-span-5 text-right">Action</div>
          </div>
        )}

        {/* Category Items */}
        <div className="divide-y divide-gray-200">
          {!isLoading && !isError && filteredCategories.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? `No categories found matching "${searchTerm}"` : 'No categories available'}
            </div>
          )}
          
          {filteredCategories.map((category) => (
            <div key={category._id || category.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
                {/* Image */}
                <div className="sm:col-span-1 lg:col-span-2 flex items-center gap-3">
                  <div className="w-12 h-12 bg-linear-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
                    {category.image || category.icon || '📦'}
                  </div>
                  <span className="lg:hidden text-sm font-medium text-gray-500">Image</span>
                </div>
                
                {/* Category Name */}
                <div className="sm:col-span-1 lg:col-span-3">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">{category.name}</span>
                  </div>
                </div>
                
                {/* Products count */}
                <div className="sm:col-span-1 lg:col-span-2 flex items-center gap-2">
                  <span className="lg:hidden text-sm font-medium text-gray-500">Products:</span>
                  <span className="text-sm text-gray-700">
                    {category.productCount || category.products || 0} items
                  </span>
                </div>

                {/* Actions */}
                <div className="sm:col-span-2 lg:col-span-5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => navigate(`/admin/sub-categories?category=${encodeURIComponent(category.name)}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View sub-categories"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setCategoryName(category.name);
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit category"
                    disabled={isDeleting}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id || category.id, category.name)}
                    disabled={isDeleting}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete category"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !isAdding && setShowAddModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Category</h2>
            
            <form onSubmit={handleAddCategory}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isAdding}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isAdding}
                  className={`flex-1 text-white font-medium py-2.5 rounded-lg transition-colors ${
                    isAdding ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isAdding ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    'Add Category'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={isAdding}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => !isUpdating && setEditingCategory(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Category</h2>
            
            <form onSubmit={handleUpdateCategory}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isUpdating}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`flex-1 text-white font-medium py-2.5 rounded-lg transition-colors ${
                    isUpdating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isUpdating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    'Update Category'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  disabled={isUpdating}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;