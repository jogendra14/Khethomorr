// backend/routes/categoryRoutes.js
import express from 'express';
import {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  getSubCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree
} from '../controller/categoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllCategories);
router.get('/tree', getCategoryTree); // Important: Place before /:id routes
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);
router.get('/:id/subcategories', getSubCategories);

// Authorize routes (protected)
router.post('/', protect,   authorize('admin', 'vendor')
, createCategory);
router.put('/:id', protect,   authorize('admin', 'vendor'),
 updateCategory);
router.delete('/:id', protect,   authorize('admin', 'vendor'),
 deleteCategory);

export default router;

