import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProductReviews, getReviewStats, createReview, deleteReview } from "../../api/reviewApi.js";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

// Star Rating Component
const StarRating = ({ rating, totalStars = 5 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex text-yellow-400 text-xl">
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={i} />
      ))}
      {hasHalfStar && <FaStarHalfAlt />}
      {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <FaRegStar key={i} />
      ))}
    </div>
  );
};

// Individual Review Component
const ReviewCard = ({ review, currentUser, onDelete, isDeleting }) => {
  const isOwner = currentUser?.id === review.userId;

  return (
    <div className="border rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-lg">{review.userName}</h3>
          <p className="text-gray-500 text-sm">Verified Buyer</p>
        </div>
        <span className="text-gray-400 text-sm">
          {new Date(review.createdAt).toLocaleDateString()}
        </span>
      </div>

      <StarRating rating={review.rating} />

      <p className="text-gray-600 leading-7 mt-2">{review.comment}</p>

      {isOwner && (
        <button
          onClick={() => onDelete(review._id)}
          disabled={isDeleting}
          className="text-red-500 text-sm mt-2 hover:text-red-700 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Delete Review'}
        </button>
      )}
    </div>
  );
};

// Add Review Form
const AddReviewForm = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const { user } = useAuth();

  // ✅ React Query mutation
  const createReviewMutation = useMutation({
    mutationFn: ({ productId, rating, comment }) => 
      createReview({ productId, rating, comment }),
    
    onSuccess: () => {
      toast.success("Review submitted successfully! ✅");
      setRating(0);
      setComment("");
      onReviewAdded();
    },
    
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to submit review ❌");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please login to review");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Please write at least 10 characters");
      return;
    }

    createReviewMutation.mutate({ productId, rating, comment });
  };

  const { isPending } = createReviewMutation;

  return (
    <form onSubmit={handleSubmit} className="border rounded-2xl p-4 mt-4">
      <h3 className="font-bold text-lg mb-3">Write a Review</h3>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium">Your Rating:</span>
        <div className="flex text-2xl">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              {star <= (hover || rating) ? (
                <FaStar className="text-yellow-400" />
              ) : (
                <FaRegStar className="text-yellow-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this product..."
        className="w-full border rounded-lg p-3 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isPending}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        disabled={isPending}
      >
        {isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

// Main ReviewSection Component
export default function ReviewSection({ product }) {
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ✅ React Query - Fetch Reviews
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ['reviews', product._id, page],
    queryFn: () => getProductReviews(product._id, page),
    enabled: !!product._id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // ✅ React Query - Fetch Review Stats
  const {
    data: statsData,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ['reviewStats', product._id],
    queryFn: () => getReviewStats(product._id),
    enabled: !!product._id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // ✅ React Query - Delete Review Mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId) => deleteReview(reviewId),
    
    onSuccess: () => {
      toast.success("Review deleted successfully! 🗑️");
      // Invalidate both reviews and stats
      queryClient.invalidateQueries({ queryKey: ['reviews', product._id] });
      queryClient.invalidateQueries({ queryKey: ['reviewStats', product._id] });
    },
    
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete review ❌");
    },
  });

  // Extract data
  const reviews = reviewsData?.reviews || [];
  const totalPages = reviewsData?.pages || 1;
  
  const stats = statsData || {
    averageRating: 0,
    totalReviews: 0,
    percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  };

  const isLoading = reviewsLoading || statsLoading;
  const isError = reviewsError || statsError;

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    deleteReviewMutation.mutate(reviewId);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Rating Distribution
  const ratingData = [5, 4, 3, 2, 1].map((star) => ({
    star,
    value: stats.percentages?.[star] || 0,
    count: stats.distribution?.[star] || 0,
  }));

  // ✅ Error State
  if (isError) {
    return (
      <section className="py-8 px-4">
        <div className="text-center py-8">
          <p className="text-red-500">⚠️ Failed to load reviews</p>
          <button
            onClick={() => {
              refetchReviews();
              queryClient.invalidateQueries({ queryKey: ['reviewStats', product._id] });
            }}
            className="mt-2 px-4 py-1 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left: Rating Summary */}
        <div>
          <div className="flex items-end gap-4">
            <h1 className="text-5xl font-bold">
              {stats.averageRating?.toFixed(1) || '0.0'}
            </h1>
            <span className="text-gray-500 text-lg">/ 5</span>
          </div>

          <StarRating rating={stats.averageRating || 0} />

          <p className="text-gray-500 mt-1">
            Based on {stats.totalReviews || 0} Reviews
          </p>

          <div className="mt-4 space-y-2">
            {ratingData.map((item) => (
              <div key={item.star} className="flex items-center gap-3">
                <span className="w-6 text-sm font-medium">{item.star}</span>
                <FaStar className="text-yellow-400 text-sm" />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 min-w-10">
                  {item.value}%
                </span>
                <span className="text-sm text-gray-400 min-w-10">
                  ({item.count})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Reviews List */}
        <div>
          {/* Review Form */}
          <AddReviewForm
            productId={product._id}
            onReviewAdded={() => {
              queryClient.invalidateQueries({ queryKey: ['reviews', product._id] });
              queryClient.invalidateQueries({ queryKey: ['reviewStats', product._id] });
            }}
          />

          {/* Reviews List */}
          <div className="mt-6 space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-2xl p-4 animate-pulse">
                    <div className="flex justify-between">
                      <div>
                        <div className="h-6 w-32 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded mt-1"></div>
                      </div>
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded mt-2"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded mt-1"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No reviews yet. Be the first to review! 🌟
              </p>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  currentUser={user}
                  onDelete={handleDeleteReview}
                  isDeleting={deleteReviewMutation.isPending}
                />
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => handlePageChange(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}