// frontend/src/pages/Categories.jsx

import { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Edit2, Trash2 } from 'lucide-react';
import { getCategoriesWithCounts, deleteCategory } from '../api/category'; // अपने API पाथ के अनुसार adjust करें

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch categories with product counts from backend
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Backend से कैटेगरी और प्रोडक्ट काउंट fetch करें
      const data = await getCategoriesWithCounts();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete category handler
  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteCategory(id);
      // Success - refresh the list
      await fetchCategories();
    } catch (err) {
      alert(`Failed to delete category: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all product categories</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="flex-1 relative">
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
      <div className="bg-white rounded-xl mt-2 shadow-sm border border-gray-200 overflow-hidden">
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Loading categories...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-red-600 mb-3">Error loading categories: {error}</p>
              <button 
                onClick={fetchCategories}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Table Header - Only show when data is loaded and no error */}
        {!loading && !error && categories.length > 0 && (
          <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-2">Image</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-2">Products</div>
            <div className="col-span-5 text-right">Action</div>
          </div>
        )}

        {/* Category Items */}
        <div className="divide-y divide-gray-200">
          {!loading && !error && filteredCategories.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? `No categories found matching "${searchTerm}"` : 'No categories available'}
            </div>
          )}
          
          {filteredCategories.map((category) => (
            <div key={category._id || category.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
                {/* Image */}
                <div className="sm:col-span-1 lg:col-span-2 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center text-2xl">
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
                
                {/* Products count - Dynamic from backend */}
                <div className="sm:col-span-1 lg:col-span-2 flex items-center gap-2">
                  <span className="lg:hidden text-sm font-medium text-gray-500">Products:</span>
                  <span className="text-sm text-gray-700">
                    {category.productCount || category.products || 0} items
                  </span>
                </div>

                {/* Actions - View/Edit/Delete */}
                <div className="sm:col-span-2 lg:col-span-5 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {/* Navigate to category products */}}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View products"
                  >
                    <span className="text-sm">View</span>
                  </button>
                  <button
                    onClick={() => {/* Edit category */}}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id || category.id, category.name)}
                    disabled={deletingId === (category._id || category.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete category"
                  >
                    {deletingId === (category._id || category.id) ? (
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
    </div>
  );
};

export default Categories;