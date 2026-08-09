import express from 'express';
import {
  createCategory,
  getCategories,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
} from '../controller/categoryController.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Admin routes
router.post('/', createCategory);
router.get('/admin/all', getAllCategories);
router.put('/:id',   updateCategory);
router.delete('/:id',  deleteCategory);
router.patch('/:id/toggle',   toggleCategoryStatus);

export default router;