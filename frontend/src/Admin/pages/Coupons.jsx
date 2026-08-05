// frontend/src/Admin/pages/Coupons.jsx

import { useState, useMemo } from 'react';
import { Search, Plus, Edit2, Trash2, Loader2, Tag, Calendar, Percent } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../api/couponApi.js';
import toast from 'react-hot-toast';

const Coupons = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    expiresAt: '',
    usageLimit: '',
    isActive: true,
  });

  // ✅ React Query - Fetch Coupons
  const {
    data: coupons = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['coupons'],
    queryFn: getCoupons,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    onError: (error) => {
      toast.error(error.message || "Failed to load coupons");
    },
  });

  // ✅ React Query - Create Coupon
  const createMutation = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success("Coupon created successfully! ✅");
      resetForm();
      setShowModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create coupon ❌");
    },
  });

  // ✅ React Query - Update Coupon
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success("Coupon updated successfully! ✅");
      resetForm();
      setShowModal(false);
      setEditingCoupon(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update coupon ❌");
    },
  });

  // ✅ React Query - Delete Coupon
  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast.success("Coupon deleted successfully! 🗑️");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete coupon ❌");
    },
  });

  // ✅ Filter coupons
  const filteredCoupons = useMemo(() => {
    if (!searchTerm.trim()) return coupons;
    const searchLower = searchTerm.toLowerCase();
    return coupons.filter(
      (coupon) =>
        coupon.code?.toLowerCase().includes(searchLower) ||
        coupon.discountType?.toLowerCase().includes(searchLower)
    );
  }, [searchTerm, coupons]);

  // ✅ Reset form
  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscount: '',
      expiresAt: '',
      usageLimit: '',
      isActive: true,
    });
    setEditingCoupon(null);
  };

  // ✅ Handle edit
  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || '',
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscount: coupon.maxDiscount || '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true,
    });
    setShowModal(true);
  };

  // ✅ Handle delete
  const handleDelete = (id, code) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${code}"?`)) return;
    deleteMutation.mutate(id);
  };

  // ✅ Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    if (!formData.code.trim()) {
      toast.error("Coupon code is required");
      return;
    }
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      toast.error("Valid discount value is required");
      return;
    }

    const data = {
      ...formData,
      discountValue: Number(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : undefined,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id, data });
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
          <div className="p-8 text-center text-gray-500">Loading coupons...</div>
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 text-lg mb-2">⚠️ Failed to load coupons</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all discount coupons</p>
          {coupons.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">Total: {coupons.length} coupons</p>
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
          Add Coupon
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search coupon..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            {searchTerm ? `No coupons found matching "${searchTerm}"` : 'No coupons available'}
          </div>
        )}
        
        {filteredCoupons.map((coupon) => (
          <div key={coupon._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-blue-600" />
                  <span className="text-lg font-bold text-gray-900">{coupon.code}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Percent className="w-3 h-3 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(coupon)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  disabled={isDeleting}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(coupon._id, coupon.code)}
                  disabled={isDeleting}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              {coupon.minOrderAmount && (
                <p className="text-gray-500">Min Order: ₹{coupon.minOrderAmount}</p>
              )}
              {coupon.maxDiscount && (
                <p className="text-gray-500">Max Discount: ₹{coupon.maxDiscount}</p>
              )}
              {coupon.usageLimit && (
                <p className="text-gray-500">Usage Limit: {coupon.usageLimit}</p>
              )}
              {coupon.expiresAt && (
                <p className="text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="mt-3 flex justify-between items-center">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {coupon.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-400">
                Used: {coupon.usedCount || 0} times
              </span>
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
              {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="e.g. SAVE20"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={isSubmitting || isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Discount Type *
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting || isUpdating}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Discount Value *
                </label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                  placeholder={formData.discountType === 'percentage' ? 'e.g. 20' : 'e.g. 100'}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                  disabled={isSubmitting || isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Minimum Order Amount
                </label>
                <input
                  type="number"
                  value={formData.minOrderAmount}
                  onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                  placeholder="e.g. 500"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting || isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Maximum Discount
                </label>
                <input
                  type="number"
                  value={formData.maxDiscount}
                  onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                  placeholder="e.g. 200"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  disabled={isSubmitting || isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({...formData, expiresAt: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting || isUpdating}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Usage Limit
                </label>
                <input
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                  placeholder="e.g. 100"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  disabled={isSubmitting || isUpdating}
                />
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
                      {editingCoupon ? 'Updating...' : 'Adding...'}
                    </span>
                  ) : (
                    editingCoupon ? 'Update Coupon' : 'Add Coupon'
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

export default Coupons;