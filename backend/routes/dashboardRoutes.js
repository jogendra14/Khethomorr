import express from 'express';
import {
  getDashboardOverview,
  getSalesAnalytics,
  getProductAnalytics,
  getUserAnalytics,
  getRevenueAnalytics,
  getRealTimeMetrics,
  exportDashboardData
} from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, authorize('admin', 'superadmin'));

// Dashboard endpoints
router.get('/overview', getDashboardOverview);
router.get('/sales-analytics', getSalesAnalytics);
router.get('/product-analytics', getProductAnalytics);
router.get('/user-analytics', getUserAnalytics);
router.get('/revenue-analytics', getRevenueAnalytics);
router.get('/realtime', getRealTimeMetrics);
router.get('/export', exportDashboardData);

export default router;