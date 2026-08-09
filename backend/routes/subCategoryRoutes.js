import express from 'express';
import {
  createSubCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  getSubCategoriesWithProducts,
  getAllSubCategories,
  getSubCategoryById,
  getSubCategoryBySlug,
  updateSubCategory,
  deleteSubCategory,
  bulkDeleteSubCategories,
  toggleSubCategoryStatus,
  bulkToggleSubCategories,
  moveSubCategories
} from '../controllers/subCategoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/with-products', getSubCategoriesWithProducts);
router.get('/category/:categoryId', getSubCategoriesByCategory);
router.get('/slug/:slug', getSubCategoryBySlug);
router.get('/', getSubCategories);
router.get('/:id', getSubCategoryById);

// Admin routes
router.post('/', protect, authorize('admin'), createSubCategory);
router.get('/admin/all', protect, authorize('admin'), getAllSubCategories);
router.put('/:id', protect, authorize('admin'), updateSubCategory);
router.delete('/:id', protect, authorize('admin'), deleteSubCategory);
router.delete('/bulk/delete', protect, authorize('admin'), bulkDeleteSubCategories);
router.patch('/:id/toggle', protect, authorize('admin'), toggleSubCategoryStatus);
router.patch('/bulk/toggle', protect, authorize('admin'), bulkToggleSubCategories);
router.patch('/move/bulk', protect, authorize('admin'), moveSubCategories);

export default router;