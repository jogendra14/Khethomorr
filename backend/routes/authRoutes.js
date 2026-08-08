// backend/routes/authRoutes.js
import express from 'express';
import {
  login,
  register,
  getMe,
  logout,
  refreshToken,
  updatePassword
} from '../controller/authController.js';
//import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me',  getMe);
router.post('/logout',  logout);
router.put('/update-password',  updatePassword);

export default router;