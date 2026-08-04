// frontend/src/components/Shop/ReviewSection.jsx
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { useState, useEffect } from "react";
import { getProductReviews, getReviewStats, createReview, deleteReview } from "../../api/reviewApi";
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
const ReviewCard = ({ review, currentUser, onDelete }) => {
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
          className="text-red-500 text-sm mt-2 hover:text-red-700"
        >
          Delete Review
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
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

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

    setLoading(true);
    try {
      await createReview({ productId, rating, comment });
      toast.success("Review submitted successfully!");
      setRating(0);
      setComment("");
      onReviewAdded();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

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
        disabled={loading}
      />

      <button
        type="submit"
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

// Main ReviewSection Component
export default function ReviewSection({ product }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reviewsData, statsData] = await Promise.all([
        getProductReviews(product._id, page),
        getReviewStats(product._id),
      ]);

      setReviews(reviewsData.reviews);
      setTotalPages(reviewsData.pages);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [product._id, page]);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;

    try {
      await deleteReview(reviewId);
      toast.success("Review deleted successfully!");
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  };

  // Rating Distribution
  const ratingData = [5, 4, 3, 2, 1].map((star) => ({
    star,
    value: stats.percentages[star] || 0,
    count: stats.distribution?.[star] || 0,
  }));

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left: Rating Summary */}
        <div>
          <div className="flex items-end gap-4">
            <h1 className="text-5xl font-bold">
              {stats.averageRating.toFixed(1)}
            </h1>
            <span className="text-gray-500 text-lg">/ 5</span>
          </div>

          <StarRating rating={stats.averageRating} />

          <p className="text-gray-500 mt-1">
            Based on {stats.totalReviews} Reviews
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
                <span className="text-sm text-gray-500 min-w-[40px]">
                  {item.value}%
                </span>
                <span className="text-sm text-gray-400 min-w-[40px]">
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
            onReviewAdded={fetchData}
          />

          {/* Reviews List */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <p className="text-center text-gray-500">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-center text-gray-500">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  currentUser={user}
                  onDelete={handleDeleteReview}
                />
              ))
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
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