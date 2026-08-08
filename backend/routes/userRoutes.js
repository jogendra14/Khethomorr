// routes/userRoutes.js
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
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteOwnAccount,
  bulkDeleteUsers,
  exportUsers
} from '../controller/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// ============================================
// ✅ PROTECTED ROUTES (All authenticated users)
// ============================================
router.use(protect); // All routes below require authentication

// Profile routes (All authenticated users)
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.delete('/account', deleteOwnAccount);

// ============================================
// ✅ ADMIN & SUPERADMIN ONLY ROUTES
// ============================================
router.use(authorize('admin', 'superadmin'));

// User management
router.get('/all', getAllUsers);
router.get('/stats', getUserStatistics);
router.get('/export', exportUsers);
router.get('/vendors', getAllVendors);
router.get('/admins', getAllAdmins);

router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

router.patch('/:id/status', toggleUserStatus);
router.patch('/:id/role', updateUserRole);

// Bulk operations
router.post('/bulk-delete', bulkDeleteUsers);

export default router;