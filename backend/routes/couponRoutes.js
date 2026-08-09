import express from 'express';
import {
  createCoupon,
  getAllCoupons,
  getAvailableCoupons,
  getCouponById,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStats
} from '../controllers/couponController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/available', getAvailableCoupons);
router.post('/validate', optionalAuth, validateCoupon);

// Admin routes
router.get('/stats', protect, authorize('admin'), getCouponStats);
router.post('/', protect, authorize('admin'), createCoupon);
router.get('/', protect, authorize('admin'), getAllCoupons);
router.get('/:id', protect, authorize('admin'), getCouponById);
router.put('/:id', protect, authorize('admin'), updateCoupon);
router.delete('/:id', protect, authorize('admin'), deleteCoupon);

export default router;