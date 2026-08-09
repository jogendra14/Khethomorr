import express from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  addTrackingInfo,
  updatePaymentStatus,
  deleteOrder,
  getOrderStats
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// User routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

// Admin routes
router.get('/', authorize('admin'), getAllOrders);
router.get('/stats/overview', authorize('admin'), getOrderStats);
router.patch('/:id/status', authorize('admin'), updateOrderStatus);
router.patch('/:id/tracking', authorize('admin'), addTrackingInfo);
router.patch('/:id/payment', authorize('admin'), updatePaymentStatus);
router.delete('/:id', authorize('admin'), deleteOrder);

export default router;