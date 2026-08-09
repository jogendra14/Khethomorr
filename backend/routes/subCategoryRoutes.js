import express from 'express';
import {
  createSubCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  toggleSubCategoryStatus
} from '../controller/subCategoryController.js';

const router = express.Router();

// Public routes
router.get('/', getSubCategories);
router.get('/:id', getSubCategoryById);

// Admin routes
router.post('/',  createSubCategory);
router.put('/:id',  updateSubCategory);
router.delete('/:id',  deleteSubCategory);
router.patch('/:id/toggle',  toggleSubCategoryStatus);

export default router;