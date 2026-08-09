import express from 'express';
import {
  createCategory,
  getCategories,
  getFeaturedCategories,
  getAllCategories,
  getCategoryStats,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  toggleCategoryStatus,
  bulkToggleCategories,
  reorderCategories,
  searchCategories
} from '../controllers/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedCategories);
router.get('/search', searchCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', protect, authorize('admin'), createCategory);
router.get('/admin/all', protect, authorize('admin'), getAllCategories);
router.get('/admin/stats', protect, authorize('admin'), getCategoryStats);
router.put('/:id', protect, authorize('admin'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);
router.delete('/bulk/delete', protect, authorize('admin'), bulkDeleteCategories);
router.patch('/:id/toggle', protect, authorize('admin'), toggleCategoryStatus);
router.patch('/bulk/toggle', protect, authorize('admin'), bulkToggleCategories);
router.patch('/reorder/list', protect, authorize('admin'), reorderCategories);

export default router;