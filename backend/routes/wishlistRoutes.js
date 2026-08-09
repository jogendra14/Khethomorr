import express from 'express';
import {
  getWishlists,
  getDefaultWishlist,
  createWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  updateWishlist,
  deleteWishlist,
  shareWishlist
} from '../controllers/cartController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Wishlist CRUD
router.get('/', getWishlists);
router.get('/default', getDefaultWishlist);
router.post('/', createWishlist);
router.put('/:id', updateWishlist);
router.delete('/:id', deleteWishlist);

// Wishlist items
router.post('/items', addToWishlist);
router.delete('/items/:productId', removeFromWishlist);

// Move to cart
router.post('/move-to-cart/:productId', moveToCart);

// Share wishlist
router.post('/:id/share', shareWishlist);

export default router;