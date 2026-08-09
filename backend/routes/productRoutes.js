import express from 'express';
import {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  getBestSellingProducts,
  getNewArrivals,
  getRelatedProducts,
  getProductsByCategory,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  permanentDeleteProduct,
  bulkDeleteProducts,
  updateProductStock,
  getLowStockProducts,
  updateProductStatus,
  toggleFeatured,
  addProductVariant,
  updateVariant,
  removeProductVariant,
  bulkUpdateProducts,
  getProductStats,
  searchProducts
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadProductImages } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/featured', getFeaturedProducts);
router.get('/best-selling', getBestSellingProducts);
router.get('/new-arrivals', getNewArrivals);
router.get('/search', searchProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/slug/:slug', getProductBySlug);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

// Admin/Vendor routes
router.post('/', protect, authorize('admin', 'vendor'), uploadProductImages, createProduct);
router.put('/:id', protect, authorize('admin', 'vendor'), uploadProductImages, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.delete('/:id/permanent', protect, authorize('admin'), permanentDeleteProduct);
router.delete('/bulk', protect, authorize('admin'), bulkDeleteProducts);
router.patch('/bulk', protect, authorize('admin'), bulkUpdateProducts);

// Stock management
router.patch('/:id/stock', protect, authorize('admin', 'vendor'), updateProductStock);
router.get('/low-stock/list', protect, authorize('admin'), getLowStockProducts);

// Status management
router.patch('/:id/status', protect, authorize('admin'), updateProductStatus);
router.patch('/:id/toggle-featured', protect, authorize('admin'), toggleFeatured);

// Variant management
router.post('/:id/variants', protect, authorize('admin', 'vendor'), addProductVariant);
router.put('/:id/variants/:variantId', protect, authorize('admin', 'vendor'), updateVariant);
router.delete('/:id/variants/:variantId', protect, authorize('admin', 'vendor'), removeProductVariant);

// Statistics (admin)
router.get('/stats/overview', protect, authorize('admin'), getProductStats);

export default router;