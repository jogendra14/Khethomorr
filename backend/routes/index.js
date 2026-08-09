import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import productRoutes from './productRoutes.js';
import categoryRoutes from './categoryRoutes.js';
import subCategoryRoutes from './subCategoryRoutes.js';
import orderRoutes from './orderRoutes.js';
import reviewRoutes from './reviewRoutes.js';
//import cartRoutes from './cartRoutes.js';
//import wishlistRoutes from './wishlistRoutes.js';
import couponRoutes from './couponRoutes.js';
//import paymentRoutes from './paymentRoutes.js';
import dealRoutes from './dealRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/subcategories', subCategoryRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
//router.use('/cart', cartRoutes);
//router.use('/wishlist', wishlistRoutes);
router.use('/coupons', couponRoutes);
//router.use('/payments', paymentRoutes);
router.use('/deals', dealRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;