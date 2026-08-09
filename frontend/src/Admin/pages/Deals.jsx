// frontend/src/Admin/pages/Deals.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Search, Plus, Pencil, Trash2, Eye, Tag, 
  Loader2, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight,
  Filter, X, ExternalLink
} from "lucide-react";
import { dealApi } from "../../api";

// ============================================
// HELPER
// ============================================
const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

// ============================================
// SKELETON
// ============================================
const TableSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Image</th>
          <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Deal Info</th>
          <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Pricing</th>
          <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
          <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
          <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 5 }).map((_, i) => (
          <tr key={i} className="border-t">
            <td className="p-4"><div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" /></td>
            <td className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
            </td>
            <td className="p-4 space-y-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
            </td>
            <td className="p-4"><div className="h-6 bg-gray-200 rounded-full animate-pulse w-16" /></td>
            <td className="p-4"><div className="h-4 bg-gray-200 rounded animate-pulse w-24" /></td>
            <td className="p-4"><div className="flex justify-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            </div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ============================================
// MAIN COMPONENT
// ============================================
export default function Deals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, title: "" });

  // ============================================
  // QUERY: Fetch Deals
  // ============================================
  const {
    data: dealsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-deals", page, limit, search, statusFilter],
    queryFn: () =>
      dealApi.getAll({
        page,
        limit,
        ...(search && { search }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      }).then(res => res.data),
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });

  const deals = dealsData?.data || [];
  const total = dealsData?.total || 0;
  const totalPages = dealsData?.pagination?.totalPages || 1;

  // ============================================
  // MUTATION: Delete Deal
  // ============================================
  const deleteMutation = useMutation({
    mutationFn: (id) => dealApi.delete(id),
    onSuccess: () => {
      toast.success("Deal deleted successfully!");
      queryClient.invalidateQueries(["admin-deals"]);
      setDeleteModal({ show: false, id: null, title: "" });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete deal");
    },
  });

  // ============================================
  // HANDLERS
  // ============================================
  const handleDelete = (deal) => {
    setDeleteModal({ show: true, id: deal._id, title: deal.title });
  };

  const confirmDelete = () => {
    if (deleteModal.id) {
      deleteMutation.mutate(deleteModal.id);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on search
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);
  };

  // ============================================
  // STATUS BADGE
  // ============================================
  const StatusBadge = ({ status, isActive }) => {
    if (!isActive) {
      return <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">Inactive</span>;
    }
    const styles = {
      active: "bg-green-100 text-green-700",
      paused: "bg-yellow-100 text-yellow-700",
      expired: "bg-red-100 text-red-700",
      draft: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals & Offers</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} deals total · Manage promotional deals and offers
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/deals/create")}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition font-medium text-sm shadow-sm"
        >
          <Plus size={18} />
          Add Deal
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search deals by title, brand..."
            value={search}
            onChange={handleSearch}
            className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition"
          />
          {search && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="expired">Expired</option>
          <option value="draft">Draft</option>
        </select>

        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm text-gray-600"
          title="Refresh"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
          <AlertTriangle className="mx-auto text-red-400 mb-3" size={40} />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to Load Deals</h3>
          <p className="text-red-600 text-sm mb-4">{error?.message || "Something went wrong"}</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
            Try Again
          </button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <TableSkeleton />
      ) : !isError ? (
        <>
          <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Deal</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Brand</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Pricing</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Status</th>
                    <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Period</th>
                    <th className="p-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-12 text-center">
                        <Tag className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-gray-500 font-medium">No deals found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {search ? "Try a different search term" : "Create your first deal"}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    deals.map((deal) => (
                      <tr key={deal._id} className="hover:bg-gray-50/50 transition">
                        {/* Deal Info */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={deal.image || "/placeholder.png"}
                              alt={deal.title}
                              className="w-14 h-14 rounded-lg object-cover border"
                            />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate max-w-[200px]">
                                {deal.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {deal.discountType === "percentage"
                                  ? `${deal.discountPercentage || Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100)}% OFF`
                                  : "Fixed Deal"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Brand */}
                        <td className="p-4 hidden md:table-cell">
                          <span className="text-sm text-gray-600 font-medium">{deal.brand || "—"}</span>
                        </td>

                        {/* Pricing */}
                        <td className="p-4">
                          <div>
                            <p className="font-semibold text-gray-900">{formatMoney(deal.dealPrice)}</p>
                            {deal.originalPrice > deal.dealPrice && (
                              <p className="text-xs text-gray-400 line-through">
                                {formatMoney(deal.originalPrice)}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="p-4 hidden lg:table-cell">
                          <StatusBadge status={deal.status} isActive={deal.isActive} />
                        </td>

                        {/* Period */}
                        <td className="p-4 hidden lg:table-cell">
                          <div className="text-sm">
                            <p className="text-gray-600">
                              {new Date(deal.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </p>
                            <p className="text-gray-400 text-xs">
                              to {new Date(deal.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </p>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => window.open(`/deal/${deal.slug || deal._id}`, "_blank")}
                              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="View"
                            >
                              <Eye size={17} />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/deals/${deal._id}/edit`)}
                              className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Pencil size={17} />
                            </button>
                            <button
                              onClick={() => handleDelete(deal)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={17} />
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{((page - 1) * limit) + 1}</span>–
                <span className="font-semibold">{Math.min(page * limit, total)}</span> of{" "}
                <span className="font-semibold">{total}</span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={18} />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) pageNum = i + 1;
                  else if (page <= 3) pageNum = i + 1;
                  else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                  else pageNum = page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                        page === pageNum
                          ? "bg-blue-600 text-white shadow-sm"
                          : "hover:bg-gray-100 text-gray-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      ) : null}

      {/* ============================================ */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ============================================ */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal({ show: false, id: null, title: "" })}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md z-10" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-600" size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Deal?</h3>
              <p className="text-gray-500 text-sm mb-2">
                Are you sure you want to delete:
              </p>
              <p className="text-gray-800 font-semibold mb-6">"{deleteModal.title}"</p>
              <p className="text-xs text-gray-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setDeleteModal({ show: false, id: null, title: "" })}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteMutation.isPending}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Deleting...
                    </>
                  ) : (
                    "Delete Deal"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}