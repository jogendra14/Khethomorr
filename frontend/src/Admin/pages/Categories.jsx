// frontend/src/Admin/pages/Categories.jsx
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Plus, Edit, Trash2, Eye, EyeOff, GripVertical,
  Loader2, AlertTriangle, RefreshCw, FolderTree,
  ChevronRight, ChevronDown, X, Image, Hash
} from "lucide-react";
import { categoryApi, subCategoryApi } from "../../api";

// ============================================
// SKELETON
// ============================================
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const PageSkeleton = () => (
  <div className="p-6 max-w-7xl mx-auto space-y-6">
    <Skeleton className="h-8 w-48" />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Skeleton className="h-96" />
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    </div>
  </div>
);

// ============================================
// MODAL COMPONENT
// ============================================
const Modal = ({ children, onClose, title }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="fixed inset-0 bg-black/50" />
    <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10" onClick={e => e.stopPropagation()}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
        </div>
      )}
      {children}
    </div>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function Categories() {
  const queryClient = useQueryClient();

  // State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, type: "", id: null, name: "" });

  // Form states
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "", image: "", order: 0 });
  const [subCategoryForm, setSubCategoryForm] = useState({ name: "", description: "", image: "", order: 0 });

  // ============================================
  // QUERY: Fetch Categories
  // ============================================
  const {
    data: categoriesData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => categoryApi.getAll().then(res => res.data),
    staleTime: 2 * 60 * 1000,
  });

  const categories = categoriesData?.data || [];

  // ============================================
  // MUTATIONS
  // ============================================

  // Create Category
  const createCategoryMutation = useMutation({
    mutationFn: (data) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setShowCategoryForm(false);
      resetCategoryForm();
      toast.success("Category created!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create"),
  });

  // Update Category
  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setEditingCategory(null);
      resetCategoryForm();
      toast.success("Category updated!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update"),
  });

  // Delete Category
  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => categoryApi.delete(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      if (selectedCategory?._id === deleteModal.id) setSelectedCategory(null);
      setDeleteModal({ show: false, type: "", id: null, name: "" });
      toast.success("Category deleted!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  // Toggle Category Status
  const toggleCategoryMutation = useMutation({
    mutationFn: (id) => categoryApi.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      toast.success("Status updated!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to toggle"),
  });

  // Create SubCategory
  const createSubCategoryMutation = useMutation({
    mutationFn: (data) => subCategoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setShowSubCategoryForm(false);
      resetSubCategoryForm();
      toast.success("SubCategory created!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create"),
  });

  // Delete SubCategory
  const deleteSubCategoryMutation = useMutation({
    mutationFn: (id) => subCategoryApi.delete(id, true),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      setDeleteModal({ show: false, type: "", id: null, name: "" });
      toast.success("SubCategory deleted!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  // Toggle SubCategory Status
  const toggleSubCategoryMutation = useMutation({
    mutationFn: (id) => subCategoryApi.toggleStatus(id),
    onSuccess: () => queryClient.invalidateQueries(["admin-categories"]),
    onError: (err) => toast.error(err.response?.data?.message || "Failed to toggle"),
  });

  // ============================================
  // HANDLERS
  // ============================================
  const resetCategoryForm = () => setCategoryForm({ name: "", description: "", image: "", order: 0 });
  const resetSubCategoryForm = () => setSubCategoryForm({ name: "", description: "", image: "", order: 0 });

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      description: cat.description || "",
      image: cat.image || "",
      order: cat.order || 0,
    });
    setShowCategoryForm(true);
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory._id, data: categoryForm });
    } else {
      createCategoryMutation.mutate(categoryForm);
    }
  };

  const handleSubCategorySubmit = (e) => {
    e.preventDefault();
    if (!subCategoryForm.name.trim()) {
      toast.error("SubCategory name is required");
      return;
    }
    createSubCategoryMutation.mutate({
      ...subCategoryForm,
      category: selectedCategory._id,
    });
  };

  const handleDelete = (type, id, name) => {
    setDeleteModal({ show: true, type, id, name });
  };

  const confirmDelete = () => {
    if (deleteModal.type === "category") {
      deleteCategoryMutation.mutate(deleteModal.id);
    } else {
      deleteSubCategoryMutation.mutate(deleteModal.id);
    }
  };

  const toggleExpand = (id) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isMutating =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending ||
    createSubCategoryMutation.isPending;

  // ============================================
  // LOADING
  // ============================================
  if (isLoading) return <PageSkeleton />;

  // ============================================
  // ERROR
  // ============================================
  if (isError) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <AlertTriangle className="mx-auto text-red-400 mb-3" size={48} />
          <h2 className="text-xl font-bold text-red-800 mb-2">Failed to Load</h2>
          <p className="text-red-600 mb-4">{error?.message}</p>
          <button onClick={() => refetch()} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="p-2.5 border rounded-lg hover:bg-gray-50" title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => { setEditingCategory(null); resetCategoryForm(); setShowCategoryForm(true); }}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT - Category List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="p-4 border-b bg-gray-50/50">
              <h2 className="font-semibold text-gray-700 flex items-center gap-2">
                <FolderTree size={18} /> All Categories
              </h2>
            </div>
            <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
              {categories.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FolderTree className="mx-auto mb-2" size={40} />
                  <p>No categories yet</p>
                </div>
              ) : (
                categories.map((cat) => (
                  <div key={cat._id}>
                    <div
                      className={`flex items-center justify-between p-3 cursor-pointer transition hover:bg-gray-50 ${
                        selectedCategory?._id === cat._id ? "bg-blue-50 border-l-4 border-blue-500" : ""
                      }`}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <button onClick={(e) => { e.stopPropagation(); toggleExpand(cat._id); }} className="p-0.5">
                          {expandedCategories.includes(cat._id) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{cat.name}</p>
                          <p className="text-xs text-gray-500">{cat.stats?.totalSubCategories || cat.subcategories?.length || 0} subs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 ml-2">
                        <button onClick={(e) => { e.stopPropagation(); handleEditClick(cat); }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                          <Edit size={14} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); toggleCategoryMutation.mutate(cat._id); }}
                          className={`p-1.5 rounded ${cat.isActive ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                          title={cat.isActive ? "Deactivate" : "Activate"}>
                          {cat.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete("category", cat._id, cat.name); }}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {/* Subcategories preview */}
                    {expandedCategories.includes(cat._id) && cat.subcategories?.length > 0 && (
                      <div className="bg-gray-50 pl-8">
                        {cat.subcategories.slice(0, 5).map(sub => (
                          <div key={sub._id} className="flex items-center justify-between py-2 px-3 text-sm text-gray-600">
                            <span className="truncate">{sub.name}</span>
                            <span className={`w-1.5 h-1.5 rounded-full ${sub.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                          </div>
                        ))}
                        {cat.subcategories.length > 5 && (
                          <p className="text-xs text-gray-400 py-2 px-3">+{cat.subcategories.length - 5} more</p>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT - Forms & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Form */}
          {(showCategoryForm || editingCategory) && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Name *</label>
                    <input type="text" value={categoryForm.name}
                      onChange={e => setCategoryForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Category name" disabled={isMutating} />
                  </div>
                  <div>
                    <label className=" text-sm font-medium mb-1 flex items-center gap-1">
                      <Hash size={14} /> Order
                    </label>
                    <input type="number" value={categoryForm.order}
                      onChange={e => setCategoryForm(p => ({ ...p, order: parseInt(e.target.value) || 0 }))}
                      className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      disabled={isMutating} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                      <Image size={14} /> Image URL
                    </label>
                    <input type="text" value={categoryForm.image}
                      onChange={e => setCategoryForm(p => ({ ...p, image: e.target.value }))}
                      className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="https://..." disabled={isMutating} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea value={categoryForm.description}
                      onChange={e => setCategoryForm(p => ({ ...p, description: e.target.value }))}
                      rows={2} className="w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Optional description" disabled={isMutating} />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={isMutating}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2">
                    {isMutating && <Loader2 className="animate-spin" size={16} />}
                    {editingCategory ? "Update" : "Create"}
                  </button>
                  <button type="button" onClick={() => { setShowCategoryForm(false); setEditingCategory(null); resetCategoryForm(); }}
                    className="px-4 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Selected Category Details & SubCategories */}
          {selectedCategory ? (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold">{selectedCategory.name}</h2>
                  <p className="text-sm text-gray-500">
                    {selectedCategory.subcategories?.length || 0} subcategories · 
                    <span className={selectedCategory.isActive ? "text-green-600" : "text-red-600"}>
                      {selectedCategory.isActive ? " Active" : " Inactive"}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowSubCategoryForm(!showSubCategoryForm)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-1"
                >
                  <Plus size={16} /> Add Sub
                </button>
              </div>

              {/* Add SubCategory Form */}
              {showSubCategoryForm && (
                <form onSubmit={handleSubCategorySubmit} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="text" placeholder="Name *" value={subCategoryForm.name}
                      onChange={e => setSubCategoryForm(p => ({ ...p, name: e.target.value }))}
                      className="px-3 py-2 border rounded-lg text-sm" required disabled={isMutating} />
                    <input type="text" placeholder="Image URL" value={subCategoryForm.image}
                      onChange={e => setSubCategoryForm(p => ({ ...p, image: e.target.value }))}
                      className="px-3 py-2 border rounded-lg text-sm" disabled={isMutating} />
                    <input type="number" placeholder="Order" value={subCategoryForm.order}
                      onChange={e => setSubCategoryForm(p => ({ ...p, order: e.target.value }))}
                      className="px-3 py-2 border rounded-lg text-sm" disabled={isMutating} />
                  </div>
                  <textarea placeholder="Description" value={subCategoryForm.description}
                    onChange={e => setSubCategoryForm(p => ({ ...p, description: e.target.value }))}
                    rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" disabled={isMutating} />
                  <div className="flex gap-2">
                    <button type="submit" disabled={isMutating}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50">
                      {isMutating ? "Adding..." : "Add SubCategory"}
                    </button>
                    <button type="button" onClick={() => setShowSubCategoryForm(false)}
                      className="px-4 py-2 bg-gray-200 rounded-lg text-sm">Cancel</button>
                  </div>
                </form>
              )}

              {/* SubCategories List */}
              {selectedCategory.subcategories?.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {selectedCategory.subcategories.map((sub) => (
                    <div key={sub._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm">{sub.name}</p>
                        {sub.description && <p className="text-xs text-gray-500 truncate">{sub.description}</p>}
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button onClick={() => toggleSubCategoryMutation.mutate(sub._id)}
                          className={`p-1.5 rounded ${sub.isActive ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                          title={sub.isActive ? "Deactivate" : "Activate"}>
                          {sub.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button onClick={() => handleDelete("subcategory", sub._id, sub.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FolderTree className="mx-auto mb-2" size={40} />
                  <p>No subcategories yet</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 p-12 text-center">
              <FolderTree className="mx-auto text-gray-300 mb-3" size={64} />
              <h3 className="text-lg font-semibold text-gray-400 mb-1">Select a Category</h3>
              <p className="text-gray-400 text-sm">Click on a category to manage its subcategories</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <Modal onClose={() => setDeleteModal({ show: false, type: "", id: null, name: "" })} title="Confirm Delete">
          <div className="text-center">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-600" size={28} />
            </div>
            <p className="text-gray-600 mb-2">Are you sure you want to delete:</p>
            <p className="font-bold text-lg mb-1">"{deleteModal.name}"</p>
            <p className="text-xs text-gray-400 mb-6">
              {deleteModal.type === "category" ? "This will also delete all subcategories." : "This action cannot be undone."}
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteModal({ show: false, type: "", id: null, name: "" })}
                className="px-5 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium">Cancel</button>
              <button onClick={confirmDelete}
                disabled={deleteCategoryMutation.isPending || deleteSubCategoryMutation.isPending}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2">
                {(deleteCategoryMutation.isPending || deleteSubCategoryMutation.isPending) && <Loader2 className="animate-spin" size={16} />}
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}