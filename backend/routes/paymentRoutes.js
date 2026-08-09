import express from 'express';
import {
  //initializePayment,
  //verifyPayment,
  //getUserPayments,
  //getAllPayments,
  //getPaymentById,
  //processRefund,
  //paymentWebhook,
  //getPaymentStats
} from '../controllers/paymentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Webhook (public - secured by signature)
router.post('/webhook', paymentWebhook);

// Protected routes
router.post('/initialize', protect, initializePayment);
router.post('/verify', protect, verifyPayment);
router.get('/', protect, getUserPayments);
router.get('/:id', protect, getPaymentById);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllPayments);
router.get('/admin/stats', protect, authorize('admin'), getPaymentStats);
router.post('/:id/refund', protect, authorize('admin'), processRefund);

export default router;
