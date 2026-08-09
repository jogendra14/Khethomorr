// frontend/src/Admin/pages/Coupons.jsx
import { useState, useMemo } from "react";
import { 
  Search, Plus, Edit2, Trash2, Loader2, Tag, Calendar, 
  Percent, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight,
  Ticket, DollarSign, Users, X, Copy, Check
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { couponApi } from "../../api";
import toast from "react-hot-toast";

// ============================================
// HELPERS
// ============================================
const formatDate = (date) => {
  if (!date) return "No expiry";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
};

const isExpired = (date) => date && new Date(date) < new Date();

// ============================================
// SKELETON
// ============================================
const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse">
    <div className="flex justify-between">
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 rounded" />
        <div className="w-8 h-8 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-20" />
      <div className="h-3 bg-gray-200 rounded w-28" />
    </div>
    <div className="mt-4 flex justify-between">
      <div className="h-6 bg-gray-200 rounded-full w-16" />
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
  </div>
);

// ============================================
// COUPON TYPE BADGE
// ============================================
const TypeBadge = ({ type }) => {
  const styles = {
    percentage: "bg-blue-100 text-blue-700",
    fixed: "bg-green-100 text-green-700",
    free_shipping: "bg-purple-100 text-purple-700",
    bogo: "bg-orange-100 text-orange-700",
  };
  const labels = {
    percentage: "Percentage",
    fixed: "Fixed Amount",
    free_shipping: "Free Shipping",
    bogo: "Buy One Get One",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${styles[type] || "bg-gray-100"}`}>
      {labels[type] || type}
    </span>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================
const Coupons = () => {
  const queryClient = useQueryClient();

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [typeFilter, setTypeFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, code: "" });
  const [copiedCode, setCopiedCode] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: "", description: "", type: "percentage", value: "",
    minPurchase: "", maxDiscount: "", startDate: "", endDate: "",
    maxUsageTotal: "", maxUsagePerUser: "1",
    showOnStore: true, isFeatured: false, isActive: true,
    badge: "", isCombinable: false, firstOrderOnly: false,
  });

  // ============================================
  // QUERY: Fetch Coupons
  // ============================================
  const {
    data: couponsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-coupons", page, limit, searchTerm, typeFilter],
    queryFn: () =>
      couponApi.getAll({
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== "all" && { type: typeFilter }),
      }).then(res => res.data),
    keepPreviousData: true,
    staleTime: 2 * 60 * 1000,
  });

  const coupons = couponsData?.data || [];
  const total = couponsData?.total || 0;
  const totalPages = couponsData?.pagination?.totalPages || 1;

  // ============================================
  // MUTATIONS
  // ============================================
  const createMutation = useMutation({
    mutationFn: (data) => couponApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-coupons"]);
      toast.success("Coupon created!");
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => couponApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-coupons"]);
      toast.success("Coupon updated!");
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => couponApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-coupons"]);
      setDeleteModal({ show: false, id: null, code: "" });
      toast.success("Coupon deleted!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  // ============================================
  // HANDLERS
  // ============================================
  const closeModal = () => {
    setShowModal(false);
    setEditingCoupon(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      code: "", description: "", type: "percentage", value: "",
      minPurchase: "", maxDiscount: "", startDate: "", endDate: "",
      maxUsageTotal: "", maxUsagePerUser: "1",
      showOnStore: true, isFeatured: false, isActive: true,
      badge: "", isCombinable: false, firstOrderOnly: false,
    });
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || "",
      description: coupon.description || "",
      type: coupon.type || "percentage",
      value: coupon.value || "",
      minPurchase: coupon.minPurchase || "",
      maxDiscount: coupon.maxDiscount || "",
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split("T")[0] : "",
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split("T")[0] : "",
      maxUsageTotal: coupon.maxUsage?.total || "",
      maxUsagePerUser: coupon.maxUsage?.perUser?.toString() || "1",
      showOnStore: coupon.showOnStore !== false,
      isFeatured: coupon.isFeatured || false,
      isActive: coupon.isActive !== false,
      badge: coupon.badge || "",
      isCombinable: coupon.isCombinable || false,
      firstOrderOnly: coupon.firstOrderOnly || false,
    });
    setShowModal(true);
  };

  const handleDelete = (coupon) => {
    setDeleteModal({ show: true, id: coupon._id, code: coupon.code });
  };

  const confirmDelete = () => {
    if (deleteModal.id) deleteMutation.mutate(deleteModal.id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.code.trim()) { toast.error("Code is required"); return; }
    if (!formData.value || Number(formData.value) <= 0) { toast.error("Valid value required"); return; }
    if (formData.type === "percentage" && Number(formData.value) > 100) { toast.error("Percentage must be 1-100"); return; }

    const data = {
      code: formData.code.toUpperCase().trim(),
      description: formData.description,
      type: formData.type,
      value: Number(formData.value),
      minPurchase: formData.minPurchase ? Number(formData.minPurchase) : 0,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
      startDate: formData.startDate || new Date().toISOString(),
      endDate: formData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      maxUsage: {
        total: formData.maxUsageTotal ? Number(formData.maxUsageTotal) : undefined,
        perUser: Number(formData.maxUsagePerUser) || 1,
      },
      showOnStore: formData.showOnStore,
      isFeatured: formData.isFeatured,
      isActive: formData.isActive,
      badge: formData.badge || undefined,
      isCombinable: formData.isCombinable,
      firstOrderOnly: formData.firstOrderOnly,
      applicableProducts: { type: "all" },
      userEligibility: formData.firstOrderOnly ? { type: "new_users" } : { type: "all" },
    };

    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Copied!");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-gray-500 text-sm mt-1">{total} coupons total</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => refetch()} className="p-2.5 border rounded-lg hover:bg-gray-50" title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button onClick={() => { resetForm(); setShowModal(true); }}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium">
            <Plus size={18} /> Add Coupon
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search coupons..." value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full border rounded-lg pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          {searchTerm && (
            <button onClick={() => { setSearchTerm(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Types</option>
          <option value="percentage">Percentage</option>
          <option value="fixed">Fixed Amount</option>
          <option value="free_shipping">Free Shipping</option>
        </select>
      </div>

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
          <AlertTriangle className="mx-auto text-red-400 mb-3" size={40} />
          <p className="text-red-600 mb-4">{error?.message}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
        </div>
      )}

      {/* Coupons Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Ticket className="mx-auto text-gray-300 mb-3" size={64} />
              <p className="text-gray-500 font-medium">No coupons found</p>
            </div>
          ) : (
            coupons.map((coupon) => {
              const expired = isExpired(coupon.endDate);
              return (
                <div key={coupon._id} className={`bg-white rounded-xl shadow-sm border p-5 hover:shadow-md transition relative overflow-hidden ${
                  expired ? "border-red-200" : coupon.isActive ? "border-green-200" : "border-gray-200"
                }`}>
                  {/* Expired Ribbon */}
                  {expired && (
                    <div className="absolute top-3 right-[-30px] bg-red-500 text-white text-xs px-8 py-0.5 rotate-45 font-medium">
                      Expired
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => copyCode(coupon.code)}
                          className="group flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition">
                          <span className="font-mono font-bold text-lg tracking-wider">{coupon.code}</span>
                          {copiedCode === coupon.code ? <Check size={16} className="text-green-600" /> : <Copy size={14} className="text-gray-400 group-hover:text-gray-600" />}
                        </button>
                      </div>
                      <TypeBadge type={coupon.type} />
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(coupon)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(coupon)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Discount */}
                  <div className="mb-3">
                    <span className="text-3xl font-bold text-blue-600">
                      {coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                    </span>
                    <span className="text-gray-500 text-sm ml-1">OFF</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-sm text-gray-600">
                    {coupon.minPurchase > 0 && (
                      <p className="flex items-center gap-1"><DollarSign size={14} /> Min: ₹{coupon.minPurchase}</p>
                    )}
                    {coupon.maxDiscount && coupon.type === "percentage" && (
                      <p className="flex items-center gap-1"><DollarSign size={14} /> Max discount: ₹{coupon.maxDiscount}</p>
                    )}
                    <p className="flex items-center gap-1"><Calendar size={14} /> {formatDate(coupon.endDate)}</p>
                    {coupon.maxUsage?.total && (
                      <p className="flex items-center gap-1"><Users size={14} /> {coupon.maxUsage.used || 0}/{coupon.maxUsage.total} used</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      expired ? "bg-red-100 text-red-700" :
                      coupon.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                    </span>
                    {coupon.isFeatured && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Featured</span>}
                    {coupon.badge && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{coupon.badge}</span>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronLeft size={18} /></button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let num;
            if (totalPages <= 5) num = i + 1;
            else if (page <= 3) num = i + 1;
            else if (page >= totalPages - 2) num = totalPages - 4 + i;
            else num = page - 2 + i;
            return (
              <button key={num} onClick={() => setPage(num)}
                className={`w-9 h-9 rounded-lg text-sm font-medium ${page === num ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>{num}</button>
            );
          })}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{editingCoupon ? "Edit Coupon" : "Add Coupon"}</h2>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Code *</label>
                  <input type="text" value={formData.code}
                    onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-mono" placeholder="SAVE20" required disabled={isMutating} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type *</label>
                  <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm" disabled={isMutating}>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Value *</label>
                  <input type="number" value={formData.value}
                    onChange={e => setFormData(p => ({ ...p, value: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder={formData.type === "percentage" ? "20" : "100"} required min="0" disabled={isMutating} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Purchase</label>
                  <input type="number" value={formData.minPurchase}
                    onChange={e => setFormData(p => ({ ...p, minPurchase: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="0" min="0" disabled={isMutating} />
                </div>
                {formData.type === "percentage" && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Max Discount</label>
                    <input type="number" value={formData.maxDiscount}
                      onChange={e => setFormData(p => ({ ...p, maxDiscount: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional" min="0" disabled={isMutating} />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Total Usage Limit</label>
                  <input type="number" value={formData.maxUsageTotal}
                    onChange={e => setFormData(p => ({ ...p, maxUsageTotal: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Unlimited" min="0" disabled={isMutating} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input type="date" value={formData.startDate}
                    onChange={e => setFormData(p => ({ ...p, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm" disabled={isMutating} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input type="date" value={formData.endDate}
                    onChange={e => setFormData(p => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm" disabled={isMutating} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Optional description" disabled={isMutating} />
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.isActive} onChange={e => setFormData(p => ({ ...p, isActive: e.target.checked }))} className="rounded" disabled={isMutating} /> Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.showOnStore} onChange={e => setFormData(p => ({ ...p, showOnStore: e.target.checked }))} className="rounded" disabled={isMutating} /> Show on Store
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData(p => ({ ...p, isFeatured: e.target.checked }))} className="rounded" disabled={isMutating} /> Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.isCombinable} onChange={e => setFormData(p => ({ ...p, isCombinable: e.target.checked }))} className="rounded" disabled={isMutating} /> Combinable
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={formData.firstOrderOnly} onChange={e => setFormData(p => ({ ...p, firstOrderOnly: e.target.checked }))} className="rounded" disabled={isMutating} /> First Order Only
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Badge (Optional)</label>
                <input type="text" value={formData.badge}
                  onChange={e => setFormData(p => ({ ...p, badge: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Hot Deal, New User" disabled={isMutating} />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={isMutating}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2">
                  {isMutating && <Loader2 className="animate-spin" size={16} />}
                  {editingCoupon ? "Update" : "Create"}
                </button>
                <button type="button" onClick={closeModal}
                  className="flex-1 px-4 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setDeleteModal({ show: false, id: null, code: "" })}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={28} />
              </div>
              <h3 className="text-lg font-bold mb-2">Delete Coupon?</h3>
              <p className="text-gray-500 mb-1">Are you sure? This cannot be undone.</p>
              <p className="font-mono font-bold text-lg mb-6">{deleteModal.code}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setDeleteModal({ show: false, id: null, code: "" })}
                  className="px-5 py-2.5 bg-gray-100 rounded-lg text-sm">Cancel</button>
                <button onClick={confirmDelete} disabled={deleteMutation.isPending}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm disabled:opacity-50 flex items-center gap-2">
                  {deleteMutation.isPending && <Loader2 className="animate-spin" size={16} />} Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;