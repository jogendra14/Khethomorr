import mongoose from "mongoose";
import Review from "../models/Review.js";
import Product from "../models/Product.js";

const isValidId = (id) => mongoose.isValidObjectId(id);

const updateProductRating = async (productId) => {
  const [result] = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: result ? Number(result.averageRating.toFixed(1)) : 0,
    reviews: result?.totalReviews || 0,
  });
};

const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    if (!isValidId(productId)) return res.status(400).json({ message: "A valid product is required" });
    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!comment?.trim() || comment.trim().length < 10) {
      return res.status(400).json({ message: "Review comment must be at least 10 characters" });
    }

    const product = await Product.exists({ _id: productId });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const duplicate = await Review.exists({ productId, userId: req.user._id });
    if (duplicate) return res.status(409).json({ message: "You have already reviewed this product" });

    const review = await Review.create({
      productId,
      userId: req.user._id,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
      isVerifiedPurchase: false,
    });
    await updateProductRating(productId);
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to create review" });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isValidId(productId)) return res.status(400).json({ message: "Invalid product id" });

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const total = await Review.countDocuments({ productId });
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean();

    res.json({ reviews, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to load reviews" });
  }
};

const getReviewStats = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!isValidId(productId)) return res.status(400).json({ message: "Invalid product id" });

    const objectId = new mongoose.Types.ObjectId(productId);
    const [summary] = await Review.aggregate([
      { $match: { productId: objectId } },
      { $group: { _id: null, averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
    ]);
    const grouped = await Review.aggregate([
      { $match: { productId: objectId } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    grouped.forEach(({ _id, count }) => { distribution[_id] = count; });
    const totalReviews = summary?.totalReviews || 0;
    const percentages = Object.fromEntries(
      Object.entries(distribution).map(([rating, count]) => [rating, totalReviews ? Math.round((count / totalReviews) * 100) : 0]),
    );

    res.json({ averageRating: summary?.averageRating || 0, totalReviews, distribution, percentages });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to load review statistics" });
  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { rating, comment } = req.body;
    if (rating !== undefined) {
      if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
      }
      review.rating = Number(rating);
    }
    if (comment !== undefined) {
      if (!comment.trim() || comment.trim().length < 10) {
        return res.status(400).json({ message: "Review comment must be at least 10 characters" });
      }
      review.comment = comment.trim();
    }

    await review.save();
    await updateProductRating(review.productId);
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to update review" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (review.userId?.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();
    await updateProductRating(review.productId);
    res.json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to delete review" });
  }
};

export { createReview, getProductReviews, getReviewStats, updateReview, deleteReview };
