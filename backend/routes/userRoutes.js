import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
  updateUserRole,
  getAllVendors,
  getAllAdmins,
  getUserStatistics,
  bulkDeleteUsers,
  bulkUpdateUsers,
  getProfile,
  updateProfile,
  changePassword,
  changeEmail,
  uploadAvatar,
  deleteOwnAccount,
  getAddresses,
  updateAddress
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadAvatar as uploadAvatarMiddleware } from '../middleware/upload.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Current user profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.put('/change-email', changeEmail);
router.post('/avatar', uploadAvatarMiddleware, uploadAvatar);
router.delete('/account', deleteOwnAccount);
router.get('/addresses', getAddresses);
router.put('/address', updateAddress);

// Admin only routes
router.get('/stats', authorize('admin', 'superadmin'), getUserStatistics);
router.get('/vendors', authorize('admin', 'superadmin'), getAllVendors);
router.get('/admins', authorize('superadmin'), getAllAdmins);
router.delete('/bulk', authorize('admin', 'superadmin'), bulkDeleteUsers);
router.patch('/bulk', authorize('admin', 'superadmin'), bulkUpdateUsers);
router.get('/', authorize('admin', 'superadmin'), getAllUsers);

// Admin routes with ID (keep at bottom to avoid conflict with above routes)
router.get('/:id', authorize('admin', 'superadmin'), getUserById);
router.put('/:id', authorize('admin', 'superadmin'), updateUser);
router.delete('/:id', authorize('admin', 'superadmin'), deleteUser);
router.patch('/:id/toggle-status', authorize('admin', 'superadmin'), toggleUserStatus);
router.patch('/:id/role', authorize('admin', 'superadmin'), updateUserRole);

export default router;