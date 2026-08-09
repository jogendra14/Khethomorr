import express from 'express';
import {
  //getCart,
  //addToCart,
  //updateCartItem,
  //removeFromCart,
  //clearCart,
  //applyCoupon,
  //removeCoupon,
  //getCartSummary,
  //mergeCarts
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Cart operations
router.get('/', getCart);
router.get('/summary', getCartSummary);
router.post('/items', addToCart);
router.patch('/items/:itemId', updateCartItem);
router.delete('/items/:itemId', removeFromCart);
router.delete('/', clearCart);

// Coupon operations
//router.post('/coupon', applyCoupon);
//router.delete('/coupon', removeCoupon);

// Merge cart (after login)
router.post('/merge', mergeCarts);

export default router;