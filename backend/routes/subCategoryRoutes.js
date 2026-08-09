import express from 'express';
import {
  createSubCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  toggleSubCategoryStatus
} from '../controllers/subCategoryController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getSubCategories);
router.get('/category/:categoryId', getSubCategoriesByCategory);
router.get('/:id', getSubCategoryById);

// Admin routes
router.post('/', protect, admin, createSubCategory);
router.put('/:id', protect, admin, updateSubCategory);
router.delete('/:id', protect, admin, deleteSubCategory);
router.patch('/:id/toggle', protect, admin, toggleSubCategoryStatus);

export default router;