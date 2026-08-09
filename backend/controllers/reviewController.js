import mongoose from 'mongoose'; // ← ADD THIS
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';

// ... baaki sab same hai
/**
 * ============================================
 * REVIEW CONTROLLER - Complete Review Management
 * ============================================
 */

// Helper: Update product rating
const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { 
      $match: { 
        productId: new mongoose.Types.ObjectId(productId),
        status: 'approved',
        isActive: true 
      } 
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  await Product.findByIdAndUpdate(productId, {
    averageRating: stats[0] ? Math.round(stats[0].averageRating * 10) / 10 : 0,
    totalReviews: stats[0]?.totalReviews || 0
  });
};

// ==================== CREATE ====================

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
const createReview = asyncHandler(async (req, res, next) => {
  const { productId, rating, title, comment, pros, cons, images } = req.body;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Validate rating
  if (!rating || rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
    throw new AppError('Rating must be a whole number between 1 and 5', 400);
  }

  // Validate comment
  if (!comment || comment.trim().length < 10) {
    throw new AppError('Review must be at least 10 characters long', 400);
  }

  // Check if user already reviewed
  const existingReview = await Review.findOne({
    productId,
    userId: req.user._id
  });

  if (existingReview) {
    throw new AppError('You have already reviewed this product', 400);
  }

  // Check verified purchase
  const order = await Order.findOne({
    userId: req.user._id,
    'items.productId': productId,
    status: 'Delivered'
  });

  // Create review
  const review = await Review.create({
    productId,
    userId: req.user._id,
    orderId: order?._id,
    userName: req.user.name,
    userAvatar: req.user.avatar,
    rating: Number(rating),
    title: title?.trim(),
    comment: comment.trim(),
    pros: Array.isArray(pros) ? pros : [],
    cons: Array.isArray(cons) ? cons : [],
    images: Array.isArray(images) ? images : [],
    isVerifiedPurchase: !!order,
    status: 'approved' // Auto-approve, change to 'pending' if manual review needed
  });

  // Update product rating
  await updateProductRating(productId);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: review
  });
});

// ==================== READ ====================

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
// @access  Public
const getProductReviews = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;
  const { 
    page = 1, 
    limit = 10, 
    rating, 
    sortBy = 'createdAt',
    sortOrder = 'desc',
    verifiedOnly = false
  } = req.query;

  // Build filter
  const filter = {
    productId,
    status: 'approved',
    isActive: true
  };

  if (rating) filter.rating = Number(rating);
  if (verifiedOnly === 'true') filter.isVerifiedPurchase = true;

  // Execute query
  const skip = (Number(page) - 1) * Number(limit);
  const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .select('-reported -__v')
      .lean(),
    Review.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    results: reviews.length,
    total,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      hasMore: skip + reviews.length < total
    },
    data: reviews
  });
});

// @desc    Get review statistics
// @route   GET /api/reviews/stats/:productId
// @access  Public
const getReviewStats = asyncHandler(async (req, res, next) => {
  const { productId } = req.params;

  const stats = await Review.aggregate([
    { 
      $match: { 
        productId: new mongoose.Types.ObjectId(productId),
        status: 'approved',
        isActive: true
      } 
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  // Build distribution
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  stats.forEach(({ _id, count }) => {
    distribution[_id] = count;
  });

  const totalReviews = Object.values(distribution).reduce((a, b) => a + b, 0);
  
  const averageRating = totalReviews > 0
    ? (
        Object.entries(distribution).reduce(
          (sum, [rating, count]) => sum + Number(rating) * count,
          0
        ) / totalReviews
      ).toFixed(1)
    : 0;

  // Calculate percentages
  const percentages = {};
  Object.entries(distribution).forEach(([rating, count]) => {
    percentages[rating] = totalReviews > 0 
      ? Math.round((count / totalReviews) * 100) 
      : 0;
  });

  res.status(200).json({
    success: true,
    data: {
      averageRating: parseFloat(averageRating),
      totalReviews,
      distribution,
      percentages
    }
  });
});

// @desc    Get user's reviews
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Review.find({ userId: req.user._id })
      .populate('productId', 'name slug images'),
    req.query
  )
    .sort()
    .paginate();

  const [reviews, total] = await Promise.all([
    features.query.lean(),
    Review.countDocuments({ userId: req.user._id })
  ]);

  res.status(200).json({
    success: true,
    results: reviews.length,
    total,
    data: reviews
  });
});

// @desc    Get single review
// @route   GET /api/reviews/:id
// @access  Public
const getReviewById = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('productId', 'name slug images price')
    .populate('userId', 'name avatar');

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  res.status(200).json({
    success: true,
    data: review
  });
});

// ==================== UPDATE ====================

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private/Owner/Admin
const updateReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Check ownership
  if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to update this review', 403);
  }

  const { rating, title, comment, pros, cons, images } = req.body;

  // Validate rating
  if (rating !== undefined) {
    if (rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
      throw new AppError('Rating must be a whole number between 1 and 5', 400);
    }
    review.rating = Number(rating);
  }

  // Validate comment
  if (comment !== undefined) {
    if (comment.trim().length < 10) {
      throw new AppError('Review must be at least 10 characters long', 400);
    }
    review.comment = comment.trim();
  }

  if (title !== undefined) review.title = title?.trim();
  if (pros !== undefined) review.pros = Array.isArray(pros) ? pros : [];
  if (cons !== undefined) review.cons = Array.isArray(cons) ? cons : [];
  if (images !== undefined) review.images = Array.isArray(images) ? images : [];

  review.isEdited = true;
  await review.save();

  // Update product rating
  await updateProductRating(review.productId);

  res.status(200).json({
    success: true,
    message: 'Review updated successfully',
    data: review
  });
});

// ==================== DELETE ====================

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private/Owner/Admin
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Check ownership
  if (review.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this review', 403);
  }

  await Review.findByIdAndDelete(req.params.id);

  // Update product rating
  await updateProductRating(review.productId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

// ==================== INTERACTIONS ====================

// @desc    Mark review as helpful
// @route   PATCH /api/reviews/:id/helpful
// @access  Private
const markHelpful = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  // Check if user already marked
  if (review.helpful.users.includes(req.user._id)) {
    throw new AppError('You have already marked this review as helpful', 400);
  }

  review.helpful.users.push(req.user._id);
  review.helpful.count += 1;
  await review.save();

  res.status(200).json({
    success: true,
    message: 'Marked as helpful',
    data: { helpfulCount: review.helpful.count }
  });
});

// @desc    Report review
// @route   PATCH /api/reviews/:id/report
// @access  Private
const reportReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  const { reason } = req.body;
  if (!reason) {
    throw new AppError('Please provide a reason for reporting', 400);
  }

  // Check if already reported
  const alreadyReported = review.reported.reasons.some(
    r => r.userId.toString() === req.user._id.toString()
  );

  if (alreadyReported) {
    throw new AppError('You have already reported this review', 400);
  }

  review.reported.reasons.push({
    userId: req.user._id,
    reason,
    timestamp: new Date()
  });
  review.reported.count += 1;

  // Auto-flag if too many reports
  if (review.reported.count >= 5) {
    review.status = 'flagged';
  }

  await review.save();

  res.status(200).json({
    success: true,
    message: 'Review reported successfully'
  });
});

// @desc    Add admin reply
// @route   POST /api/reviews/:id/reply
// @access  Private/Admin
const addAdminReply = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  const { comment } = req.body;
  if (!comment) {
    throw new AppError('Reply comment is required', 400);
  }

  review.adminReply = {
    comment: comment.trim(),
    repliedBy: req.user._id,
    repliedAt: new Date()
  };

  await review.save();

  res.status(200).json({
    success: true,
    message: 'Reply added successfully',
    data: review.adminReply
  });
});

// ==================== ADMIN ====================

// @desc    Get all reviews (admin)
// @route   GET /api/reviews/admin/all
// @access  Private/Admin
const getAllReviews = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Review.find()
      .populate('productId', 'name slug')
      .populate('userId', 'name email'),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const [reviews, total] = await Promise.all([
    features.query.lean(),
    Review.countDocuments()
  ]);

  res.status(200).json({
    success: true,
    results: reviews.length,
    total,
    pagination: features.pagination,
    data: reviews
  });
});

// @desc    Update review status (admin)
// @route   PATCH /api/reviews/:id/status
// @access  Private/Admin
const updateReviewStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'approved', 'rejected', 'flagged'];

  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (!review) {
    throw new AppError('Review not found', 404);
  }

  await updateProductRating(review.productId);

  res.status(200).json({
    success: true,
    message: `Review status updated to ${status}`,
    data: review
  });
});

export {
  createReview,
  getProductReviews,
  getReviewStats,
  getUserReviews,
  getReviewById,
  updateReview,
  deleteReview,
  markHelpful,
  reportReview,
  addAdminReply,
  getAllReviews,
  updateReviewStatus
};