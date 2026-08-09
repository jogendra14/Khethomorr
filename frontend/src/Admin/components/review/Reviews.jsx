import { useState } from "react";
import { toast } from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Trash2, CheckCircle, XCircle, Loader2, AlertTriangle, RefreshCw, Eye } from "lucide-react";
import { reviewApi } from "../../api";

const StatusBadge = ({ status }) => {
  const styles = {
    approved: "bg-green-100 text-green-700", pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700", flagged: "bg-orange-100 text-orange-700",
  };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status]}`}>{status}</span>;
};

export default function Reviews() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin-reviews", page, statusFilter],
    queryFn: () => reviewApi.getAllReviews({ page, limit: 10, status: statusFilter !== "all" ? statusFilter : undefined }).then(r => r.data),
    keepPreviousData: true,
  });

  const reviews = data?.data || [];
  const total = data?.total || 0;
  const totalPages = data?.pagination?.totalPages || 1;

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => reviewApi.updateStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries(["admin-reviews"]); toast.success("Updated!"); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => reviewApi.deleteReview(id),
    onSuccess: () => { queryClient.invalidateQueries(["admin-reviews"]); toast.success("Deleted!"); },
  });

  if (isError) return (
    <div className="p-6 text-center"><AlertTriangle className="mx-auto text-red-400" size={48} /><p className="text-red-600">{error?.message}</p></div>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div><h1 className="text-2xl font-bold">Reviews</h1><p className="text-gray-500 text-sm">{total} reviews</p></div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2 text-sm">
            <option value="all">All</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="flagged">Flagged</option>
          </select>
          <button onClick={() => refetch()} className="p-2 border rounded-lg"><RefreshCw size={18} /></button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-xl p-4 animate-pulse"><div className="h-4 bg-gray-200 rounded w-3/4 mb-2" /><div className="h-3 bg-gray-200 rounded w-1/2" /></div>)}</div>
      ) : (
        <div className="space-y-3">
          {reviews.length === 0 ? <div className="text-center py-12 text-gray-500">No reviews found</div> : reviews.map(review => (
            <div key={review._id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <img src={review.userId?.avatar || "https://i.pravatar.cc/30"} alt="" className="w-6 h-6 rounded-full" />
                    <span className="font-medium text-sm">{review.userId?.name || "User"}</span>
                    <span className="text-yellow-500 text-sm">{"⭐".repeat(review.rating)}</span>
                    <StatusBadge status={review.status} />
                    {review.isVerifiedPurchase && <span className="text-xs text-green-600">✓ Purchase</span>}
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    On: {review.productId?.name || "Product"} · {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1 ml-4">
                  {review.status !== "approved" && (
                    <button onClick={() => statusMutation.mutate({ id: review._id, status: "approved" })} className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Approve"><CheckCircle size={16} /></button>
                  )}
                  {review.status !== "rejected" && (
                    <button onClick={() => statusMutation.mutate({ id: review._id, status: "rejected" })} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Reject"><XCircle size={16} /></button>
                  )}
                  <button onClick={() => deleteMutation.mutate(review._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}