import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  getMe,
  updatePassword,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/auth.js';

const router = express.Router();

// Rate limiter for auth routes
const authLimiter = rateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Public routes
router.post('/register', register);
router.post('/login', authLimiter, login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.post('/logout', protect, logout);

export default router;