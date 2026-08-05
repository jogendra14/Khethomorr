// frontend/src/Admin/pages/Banner.jsx

import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBanners, createBanner, updateBanner, deleteBanner } from '../../api/bannerApi.js';
import toast from 'react-hot-toast';

const Banner = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '',
    position: 'home',
    isActive: true,
    order: 0,
  });

  // ✅ React Query - Fetch Banners
  const {
    data: banners = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['banners'],
    queryFn: getBanners,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    onError: (error) => {
      toast.error(error.message || "Failed to load banners");
    },
  });

  // ✅ React Query - Create Banner
  const createMutation = useMutation({
    mutationFn: createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success("Banner created successfully! ✅");
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create banner ❌");
    },
  });

  // ✅ React Query - Update Banner
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success("Banner updated successfully! ✅");
      resetForm();
      setShowModal(false);
      setEditingBanner(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update banner ❌");
    },
  });

  // ✅ React Query - Delete Banner
  const deleteMutation = useMutation({
    mutationFn: deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success("Banner deleted successfully! 🗑️");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete banner ❌");
    },
  });

  // ✅ Filter banners
  const filteredBanners = useMemo(() => {
    if (!searchTerm.trim()) return banners;
    const searchLower = searchTerm.toLowerCase();
    return banners.filter(
      (banner) =>
        banner.title?.toLowerCase().includes(searchLower) ||
        banner.position?.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, banners]);

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      image: '',
      link: '',
      position: 'home',
      isActive: true,
      order: 0,
    });
    setPreviewImage(null);
    setEditingBanner(null);
  };

  // ✅ Handle edit
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      image: banner.image || '',
      link: banner.link || '',
      position: banner.position || 'home',
      isActive: banner.isActive !== undefined ? banner.isActive : true,
      order: banner.order || 0,
    });
    setPreviewImage(banner.image || null);
    setShowModal(true);
  };

  // ✅ Handle delete
  const handleDelete = (id, title) => {
    if (!window.confirm(`Are you sure you want to delete banner "${title}"?`)) return;
    deleteMutation.mutate(id);
  };

  // ✅ Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({...formData, image: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.title.trim()) {
      toast.error("Banner title is required");
      return;
    }
    if (!formData.image) {
      toast.error("Banner image is required");
      return;
    }

    const data = {
      ...formData,
      order: Number(formData.order),
    };

    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const { isPending: isSubmitting } = createMutation;
  const { isPending: isUpdating } = updateMutation;
  const { isPending: isDeleting } = deleteMutation;

  // ✅ Loading State
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mt-1 animate-pulse"></div>
          </div>
          <div className="h-10 w-36 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-8 text-center text-gray-500">Loading banners...</div>
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg mb-2">⚠️ Failed to load banners</p>
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
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all website banners</p>
          {banners.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">Total: {banners.length} banners</p>
          )}
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search banner..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBanners.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            {searchTerm ? `No banners found matching "${searchTerm}"` : 'No banners available'}
          </div>
        )}
        
        {filteredBanners.map((banner) => (
          <div key={banner._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
            {/* Image */}
            <div className="relative h-40 bg-gray-100">
              <img
                src={banner.image || 'https://via.placeholder.com/400x200?text=No+Image'}
                alt={banner.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => handleEdit(banner)}
                  className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition shadow"
                  disabled={isDeleting}
                >
                  <Edit2 className="w-4 h-4 text-gray-700" />
                </button>
                <button
                  onClick={() => handleDelete(banner._id, banner.title)}
                  disabled={isDeleting}
                  className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition shadow disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin text-red-600" /> : <Trash2 className="w-4 h-4 text-red-600" />}
                </button>
              </div>
              {!banner.isActive && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg bg-red-600 px-4 py-1 rounded-full">Inactive</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{banner.title}</h3>
              {banner.subtitle && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{banner.subtitle}</p>
              )}
              <div className="mt-2 flex justify-between items-center text-sm">
                <span className="text-gray-500">Position: <span className="font-medium capitalize">{banner.position}</span></span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  banner.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {banner.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {banner.link && (
                <a href={banner.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block truncate">
                  {banner.link}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => {
            if (!isSubmitting && !isUpdating) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {editingBanner ? 'Edit Banner' : 'Add Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Summer Sale"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting || isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="e.g. Up to 50% off"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting || isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Image *
                </label>
                {previewImage && (
                  <div className="mb-2">
                    <img src={previewImage} alt="Preview" className="w-full h-32 object-cover rounded-lg border" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={isSubmitting || isUpdating}
                />
                <p className="text-xs text-gray-400 mt-1">Upload image (JPG, PNG, WebP)</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Link (URL)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  placeholder="https://example.com/sale"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting || isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Position
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting || isUpdating}
                >
                  <option value="home">Home Page</option>
                  <option value="shop">Shop Page</option>
                  <option value="deals">Deals Page</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({...formData, order: e.target.value})}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  disabled={isSubmitting || isUpdating}
                />
                <p className="text-xs text-gray-400 mt-1">Lower number = Higher priority</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  disabled={isSubmitting || isUpdating}
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting || isUpdating}
                  className={`flex-1 text-white font-medium py-2.5 rounded-lg transition ${
                    isSubmitting || isUpdating
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting || isUpdating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingBanner ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    editingBanner ? 'Update Banner' : 'Add Banner'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  disabled={isSubmitting || isUpdating}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2.5 rounded-lg transition"
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

export default Banner;