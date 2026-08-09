import express from 'express';
import {
  createDeal,
  getDeals,
  getAllDeals,
  getDealById,
  getDealBySlug,
  updateDeal,
  deleteDeal,
  bulkDeleteDeals,
  toggleDealStatus,
  pauseDeal,
  activateDeal,
  getFeaturedDeals,
  getDealStats,
  trackDealClick
} from '../controllers/dealController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadDealImages } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedDeals);
router.get('/slug/:slug', getDealBySlug);
router.get('/', getDeals);
router.get('/:id', getDealById);
router.post('/:id/track-click', trackDealClick);

// Admin routes
router.post('/', protect, authorize('admin'), uploadDealImages, createDeal);
router.get('/admin/all', protect, authorize('admin'), getAllDeals);
router.get('/admin/stats', protect, authorize('admin'), getDealStats);
router.put('/:id', protect, authorize('admin'), uploadDealImages, updateDeal);
router.delete('/:id', protect, authorize('admin'), deleteDeal);
router.delete('/bulk/delete', protect, authorize('admin'), bulkDeleteDeals);
router.patch('/:id/toggle', protect, authorize('admin'), toggleDealStatus);
router.patch('/:id/pause', protect, authorize('admin'), pauseDeal);
router.patch('/:id/activate', protect, authorize('admin'), activateDeal);

export default router;