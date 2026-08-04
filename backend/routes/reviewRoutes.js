// backend/routes/reviewRoutes.js

import express from "express";
import {
  createReview,
  getProductReviews,
  deleteReview,
  updateReview,
  getReviewStats,
} from "../controller/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/product/:productId")
  .get(getProductReviews);

router.route("/stats/:productId")
  .get(getReviewStats);

router.route("/")
  .post(createReview);

router.route("/:id")
  .put(protect, updateReview)
  .delete(protect, deleteReview);

export default router;