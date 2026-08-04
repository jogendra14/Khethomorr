// backend/controllers/reviewController.js
import Review from "../models/Review.js";
import Product from "../models/Product.js";
import mongoose from 'mongoose'; 

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = await Review.create({
      productId,
      userId: req.user._id,
      userName: req.user.name,
      rating,
      comment,
      isVerifiedPurchase: false, // You can implement order verification later
    });

    // Update product average rating
    await updateProductRating(productId);

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ productId });

    res.json({
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get review statistics
// @route   GET /api/reviews/stats/:productId
// @access  Public
export const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;

    const stats = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const totalReviews = await Review.countDocuments({ productId });
    const averageRating = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          avg: { $avg: "$rating" },
        },
      },
    ]);

    // Create rating distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    stats.forEach((item) => {
      distribution[item._id] = item.count;
    });

    // Calculate percentages
    const percentages = {};
    Object.keys(distribution).forEach((key) => {
      percentages[key] = totalReviews > 0 
        ? Math.round((distribution[key] / totalReviews) * 100) 
        : 0;
    });

    res.json({
      averageRating: averageRating[0]?.avg || 0,
      totalReviews,
      distribution,
      percentages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update product rating
const updateProductRating = async (productId) => {
  const result = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Number(result[0].avgRating.toFixed(1)),
      reviews: result[0].totalReviews,
    });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if user owns the review or is admin
    if (review.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();
    await updateProductRating(review.productId);

    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    await updateProductRating(review.productId);

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};