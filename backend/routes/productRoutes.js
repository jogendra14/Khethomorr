// routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  updateProductStatus,
  updateProductStock,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getProductStats,
  bulkUpdateProducts,
  addProductVariant,
  removeProductVariant
} from '../controller/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/stats', protect, authorize('admin'), getProductStats);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (require authentication)
//router.use(protect);

// Admin routes
router.post(
  '/',
  protect,
  authorize('admin', 'vendor'),
  upload.array('images', 10), // Max 10 images
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'vendor'),
  upload.array('images', 5),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteProduct
);

router.post(
  '/bulk-delete',
  protect,
  authorize('admin'),
  bulkDeleteProducts
);

router.put(
  '/bulk-update',
  protect,
  authorize('admin'),
  bulkUpdateProducts
);

router.patch(
  '/:id/status',
  protect,
  authorize('admin'),
  updateProductStatus
);

router.patch(
  '/:id/stock',
  protect,
  authorize('admin', 'vendor'),
  updateProductStock
);

// Variant routes
router.post(
  '/:id/variants',
  protect,
  authorize('admin', 'vendor'),
  addProductVariant
);

router.delete(
  '/:id/variants/:variantId',
  protect,
  authorize('admin', 'vendor'),
  removeProductVariant
);

export default router;