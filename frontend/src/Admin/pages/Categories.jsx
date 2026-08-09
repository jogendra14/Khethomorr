// frontend/src/pages/admin/Categories.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import CategoryAPI from "../../api/categoryApi";
import { FiEdit2, FiTrash2, FiPlus, FiChevronRight, FiChevronDown } from "react-icons/fi";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentCategory: "",
    image: "",
    isActive: true,
  });
  const [viewMode, setViewMode] = useState("flat"); // 'flat' or 'tree'

  // Fetch categories on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCategories();
      } catch(e) { /* ignore */ }

      try {
        await fetchCategoryTree();
      } catch(e) { /* ignore */ }
    };

    loadData();
  }, []);

  // Fetch all categories (flat list)
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await CategoryAPI.getAllCategories();
      setCategories(response.data || response.categories || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch categories");
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch category tree (hierarchical)
  const fetchCategoryTree = async () => {
    try {
      const response = await CategoryAPI.getCategoryTree();
      setCategoryTree(response.data || []);
    } catch (error) {
      console.error("Error fetching category tree:", error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      parentCategory: "",
      image: "",
      isActive: true,
    });
    setEditingCategory(null);
  };

  // Open modal for creating new category
  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
  };

  // Open modal for editing existing category
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      parentCategory: category.parentCategory?._id || category.parentCategory || "",
      image: category.image || "",
      isActive: category.isActive !== undefined ? category.isActive : true,
    });
    setShowModal(true);
  };

  // Create or update category
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        parentCategory: formData.parentCategory || null,
        image: formData.image.trim() || '', // Send as string, not object
        isActive: formData.isActive,
      };
      
      console.log('Sending category data:', categoryData); // Debug log

      if (editingCategory) {
        // Update existing category
        await CategoryAPI.updateCategory(editingCategory._id, categoryData);
        toast.success("Category updated successfully");
      } else {
        // Create new category
        await CategoryAPI.createCategory(categoryData);
        toast.success("Category created successfully");
      }

      setShowModal(false);
      resetForm();
      fetchCategories();
      fetchCategoryTree();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
      console.error("Error saving category:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      await CategoryAPI.deleteCategory(categoryId);
      toast.success("Category deleted successfully");
      fetchCategories();
      fetchCategoryTree();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete category");
      console.error("Error deleting category:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle subcategories visibility
  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Fetch subcategories
  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await CategoryAPI.getSubCategories(categoryId);
      return response.data || [];
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      return [];
    }
  };

  // Handle view mode toggle
  const handleViewModeChange = async (mode) => {
    setViewMode(mode);
    if (mode === "tree") {
      await fetchCategoryTree();
    } else {
      await fetchCategories();
    }
  };

  // Render tree view recursively
  const renderTreeView = (categories, level = 0) => {
    return categories.map((category) => (
      <div key={category._id} className="ml-4">
        <div className={`flex items-center justify-between p-3 border rounded-lg mb-2 hover:bg-gray-50 ${level > 0 ? 'ml-' + (level * 4) : ''}`}>
          <div className="flex items-center gap-3">
            {category.subCategories && category.subCategories.length > 0 && (
              <button
                onClick={() => toggleExpand(category._id)}
                className="text-gray-500 hover:text-gray-700"
              >
                {expandedCategories[category._id] ? <FiChevronDown /> : <FiChevronRight />}
              </button>
            )}
            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-10 h-10 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="font-medium text-gray-900">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-500">{category.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {category.isActive ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={() => handleEdit(category)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <FiEdit2 size={16} />
            </button>
            <button
              onClick={() => handleDelete(category._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>
        {expandedCategories[category._id] && category.subCategories && (
          <div className="ml-6">
            {renderTreeView(category.subCategories, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  // Get parent category options (exclude current editing category and its children)
  const getParentCategoryOptions = () => {
    if (editingCategory) {
      return categories.filter(cat => cat._id !== editingCategory._id);
    }
    return categories;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-1">Manage your product categories</p>
        </div>
        <div className="flex gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('flat')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'flat' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              Flat View
            </button>
            <button
              onClick={() => handleViewModeChange('tree')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'tree' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              Tree View
            </button>
          </div>
          <button
            type="submit"
            onClick={handleAddNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories List */}
      {loading && !showModal ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === "flat" ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No categories found. Click "Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {category.image && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={category.image}
                            alt={category.name}
                          />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {category.description || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {category.parentCategory?.name || "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          category.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          {categoryTree.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No categories found in tree view.
            </div>
          ) : (
            renderTreeView(categoryTree)
          )}
        </div>
      )}

      {/* Modal for Add/Edit Category */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            {/*<div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowModal(false)}></div>
            </div>*/}

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {/* Category Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter category name"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter category description"
                      />
                    </div>

                    {/* Parent Category */}
                    <div>
                      <label htmlFor="parentCategory" className="block text-sm font-medium text-gray-700 mb-1">
                        Parent Category
                      </label>
                      <select
                        id="parentCategory"
                        name="parentCategory"
                        value={formData.parentCategory}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">None (Top Level Category)</option>
                        {getParentCategoryOptions().map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Image URL */}
                    <div>
                      <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                        Image URL
                      </label>
                      <input
                        type="url"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                        Active
                      </label>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </span>
                      ) : editingCategory ? (
                        "Update Category"
                      ) : (
                        "Create Category"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;