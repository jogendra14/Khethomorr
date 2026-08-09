import express from 'express';
import {
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
} from '../controllers/reviewController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/stats/:productId', getReviewStats);
router.get('/:id', getReviewById);

// Protected routes
router.post('/', protect, createReview);
router.get('/user/my-reviews', protect, getUserReviews);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.patch('/:id/helpful', protect, markHelpful);
router.patch('/:id/report', protect, reportReview);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllReviews);
router.post('/:id/reply', protect, authorize('admin'), addAdminReply);
router.patch('/:id/status', protect, authorize('admin'), updateReviewStatus);

export default router;