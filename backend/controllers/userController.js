import mongoose from 'mongoose'; // ← ADD THIS
import User from '../models/User.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import Wishlist from '../models/Wishlist.js'; // ← ADD THIS
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

// ... baaki sab same hai
/**
 * ============================================
 * USER CONTROLLER - Complete User Management
 * ============================================
 * Features: CRUD, Profile, Avatar, Stats,
 * Role Management, Bulk Operations
 */

// ==================== ADMIN: GET ALL USERS ====================

// @desc    Get all users (Admin & SuperAdmin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res, next) => {
  // Build filter
  const filter = {};

  // Role filter
  if (req.query.role) {
    filter.role = req.query.role;
  }

  // Active/Inactive filter
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  // Email verified filter
  if (req.query.isEmailVerified !== undefined) {
    filter.isEmailVerified = req.query.isEmailVerified === 'true';
  }

  // Search by name or email
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  // Execute query with APIFeatures
  const features = new APIFeatures(
    User.find(filter).select('-password -refreshToken -__v'),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [users, total] = await Promise.all([
    features.query.lean(),
    User.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    results: users.length,
    total,
    pagination: {
      ...features.pagination,
      totalPages: Math.ceil(total / (features.pagination.limit || 10))
    },
    data: users
  });
});

// ==================== ADMIN: GET SINGLE USER ====================

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password -refreshToken -__v')
    .lean();

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Get user's order summary
  const orderStats = await Order.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(req.params.id) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        lastOrder: { $max: '$createdAt' }
      }
    }
  ]);

  // Get user's review count
  const reviewCount = await Review.countDocuments({ userId: req.params.id });

  res.status(200).json({
    success: true,
    data: {
      ...user,
      stats: {
        totalOrders: orderStats[0]?.totalOrders || 0,
        totalSpent: orderStats[0]?.totalSpent || 0,
        lastOrder: orderStats[0]?.lastOrder || null,
        totalReviews: reviewCount
      }
    }
  });
});

// ==================== ADMIN: UPDATE USER ====================

// @desc    Update user (Admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
  const { name, email, role, isActive, isEmailVerified, phone, address } = req.body;

  // Check if user exists
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check email uniqueness
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
    if (emailExists) {
      throw new AppError('Email already in use by another user', 400);
    }
  }

  // Validate role
  if (role) {
    const validRoles = ['user', 'vendor', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    // Only superadmin can assign admin/superadmin roles
    if (['admin', 'superadmin'].includes(role) && req.user.role !== 'superadmin') {
      throw new AppError('Only superadmin can assign admin roles', 403);
    }
  }

  // Build update object
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (role !== undefined) updateData.role = role;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (isEmailVerified !== undefined) updateData.isEmailVerified = isEmailVerified;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -refreshToken -__v');

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  });
});

// ==================== ADMIN: DELETE USER ====================

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  // Prevent self-deletion
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent deleting superadmin by non-superadmin
  if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
    throw new AppError('You cannot delete a superadmin account', 403);
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully'
  });
});

// ==================== ADMIN: TOGGLE USER STATUS ====================

// @desc    Toggle user active status
// @route   PATCH /api/users/:id/toggle-status
// @access  Private/Admin
const toggleUserStatus = asyncHandler(async (req, res, next) => {
  // Prevent self-deactivation
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot change your own status', 400);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent deactivating superadmin
  if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
    throw new AppError('You cannot modify superadmin status', 403);
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { isActive: user.isActive }
  });
});

// ==================== ADMIN: UPDATE USER ROLE ====================

// @desc    Update user role
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  // Validate role
  const validRoles = ['user', 'vendor', 'admin', 'superadmin'];
  if (!validRoles.includes(role)) {
    throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
  }

  // Prevent changing own role
  if (req.params.id === req.user._id.toString()) {
    throw new AppError('You cannot change your own role', 400);
  }

  // Only superadmin can assign superadmin role
  if (role === 'superadmin' && req.user.role !== 'superadmin') {
    throw new AppError('Only superadmin can assign superadmin role', 403);
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent modifying superadmin
  if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
    throw new AppError('You cannot modify superadmin role', 403);
  }

  user.role = role;
  await user.save();

  // Send notification email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Role Updated - Your Account Role Has Changed',
      message: `Hello ${user.name},\n\nYour account role has been updated to "${role}".\n\nIf you didn't expect this change, please contact support immediately.\n\nBest regards,\nTeam`
    });
  } catch (error) {
    console.log('Email notification failed:', error.message);
  }

  res.status(200).json({
    success: true,
    message: `User role updated to ${role}`,
    data: { role: user.role }
  });
});

// ==================== ADMIN: GET VENDORS ====================

// @desc    Get all vendors
// @route   GET /api/users/vendors
// @access  Private/Admin
const getAllVendors = asyncHandler(async (req, res, next) => {
  const filter = { role: 'vendor' };

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const features = new APIFeatures(
    User.find(filter).select('-password -refreshToken -__v'),
    req.query
  )
    .sort()
    .paginate();

  const [vendors, total] = await Promise.all([
    features.query.lean(),
    User.countDocuments(filter)
  ]);

  // Get product count for each vendor
  const vendorsWithStats = await Promise.all(
    vendors.map(async (vendor) => {
      const productCount = await Product.countDocuments({ vendor: vendor._id });
      return { ...vendor, productCount };
    })
  );

  res.status(200).json({
    success: true,
    results: vendors.length,
    total,
    pagination: features.pagination,
    data: vendorsWithStats
  });
});

// ==================== ADMIN: GET ADMINS ====================

// @desc    Get all admins
// @route   GET /api/users/admins
// @access  Private/SuperAdmin
const getAllAdmins = asyncHandler(async (req, res, next) => {
  const admins = await User.find({
    role: { $in: ['admin', 'superadmin'] }
  })
    .select('-password -refreshToken -__v')
    .sort({ role: 1, name: 1 })
    .lean();

  res.status(200).json({
    success: true,
    count: admins.length,
    data: admins
  });
});

// ==================== ADMIN: USER STATISTICS ====================

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStatistics = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const [
    totalUsers,
    activeUsers,
    verifiedUsers,
    newUsersToday,
    newUsersThisMonth,
    newUsersLastMonth,
    roleDistribution,
    registrationTrend
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    User.countDocuments({ isEmailVerified: true }),
    User.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: thisMonth } }),
    User.countDocuments({
      createdAt: {
        $gte: lastMonth,
        $lt: thisMonth
      }
    }),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]),
    User.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(today.getFullYear(), today.getMonth() - 6, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        newUsersToday,
        newUsersThisMonth,
        newUsersLastMonth,
        growthRate: lastMonth > 0
          ? Math.round(((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100)
          : 0
      },
      roleDistribution,
      registrationTrend
    }
  });
});

// ==================== ADMIN: BULK OPERATIONS ====================

// @desc    Bulk delete users
// @route   DELETE /api/users/bulk
// @access  Private/Admin
const bulkDeleteUsers = asyncHandler(async (req, res, next) => {
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    throw new AppError('Please provide an array of user IDs', 400);
  }

  // Remove current user from array to prevent self-deletion
  const filteredIds = userIds.filter(id => id !== req.user._id.toString());

  // Remove superadmin IDs if current user is not superadmin
  const superAdmins = await User.find({
    _id: { $in: filteredIds },
    role: 'superadmin'
  }).select('_id');

  if (superAdmins.length > 0 && req.user.role !== 'superadmin') {
    const superAdminIds = superAdmins.map(a => a._id.toString());
    filteredIds = filteredIds.filter(id => !superAdminIds.includes(id));
  }

  const result = await User.deleteMany({ _id: { $in: filteredIds } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} users deleted successfully`,
    data: {
      deletedCount: result.deletedCount,
      skippedCount: userIds.length - result.deletedCount
    }
  });
});

// @desc    Bulk update users
// @route   PATCH /api/users/bulk
// @access  Private/Admin
const bulkUpdateUsers = asyncHandler(async (req, res, next) => {
  const { userIds, updates } = req.body;

  if (!userIds?.length || !updates) {
    throw new AppError('Please provide userIds and updates', 400);
  }

  // Allowed fields for bulk update
  const allowedFields = ['isActive', 'isEmailVerified', 'role'];
  const filteredUpdates = {};

  Object.keys(updates).forEach(key => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  if (Object.keys(filteredUpdates).length === 0) {
    throw new AppError('No valid fields to update', 400);
  }

  // Prevent self-modification
  const targetIds = userIds.filter(id => id !== req.user._id.toString());

  const result = await User.updateMany(
    { _id: { $in: targetIds } },
    { $set: filteredUpdates }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} users updated successfully`
  });
});

// ==================== USER: PROFILE ====================

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('-password -refreshToken -__v -loginAttempts -lockUntil')
    .lean();

  // Get additional stats
  const [orderCount, reviewCount, wishlistCount] = await Promise.all([
    Order.countDocuments({ userId: req.user._id }),
    Review.countDocuments({ userId: req.user._id }),
    Wishlist.countDocuments({ userId: req.user._id, isActive: true })
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...user,
      stats: {
        totalOrders: orderCount,
        totalReviews: reviewCount,
        wishlistItems: wishlistCount
      }
    }
  });
});

// @desc    Update profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res, next) => {
  const { name, phone, address, avatar } = req.body;

  // Users cannot change email from profile update
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (phone !== undefined) updateData.phone = phone;
  if (address !== undefined) updateData.address = address;
  if (avatar !== undefined) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -refreshToken -__v');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Validate inputs
  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Generate new token
  const token = user.generateToken();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    token
  });
});

// @desc    Update email
// @route   PUT /api/users/change-email
// @access  Private
const changeEmail = asyncHandler(async (req, res, next) => {
  const { newEmail, password } = req.body;

  if (!newEmail || !password) {
    throw new AppError('Please provide new email and password', 400);
  }

  // Check if email already exists
  const emailExists = await User.findOne({ email: newEmail });
  if (emailExists) {
    throw new AppError('Email already in use', 400);
  }

  // Verify password
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Password is incorrect', 401);
  }

  // Update email and set unverified
  user.email = newEmail;
  user.isEmailVerified = false;

  // Generate verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  // Send verification email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message: `Please verify your new email by clicking: ${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`
    });
  } catch (error) {
    console.log('Email sending failed:', error);
  }

  res.status(200).json({
    success: true,
    message: 'Email updated. Please verify your new email address'
  });
});

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
const uploadAvatar = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    throw new AppError('Please upload an image file', 400);
  }

  const avatarUrl = req.file.path || req.file.location;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: avatarUrl },
    { new: true }
  ).select('-password -refreshToken -__v');

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: { avatar: user.avatar }
  });
});

// @desc    Delete own account
// @route   DELETE /api/users/account
// @access  Private
const deleteOwnAccount = asyncHandler(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    throw new AppError('Please provide your password to confirm deletion', 400);
  }

  // Verify password
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Password is incorrect', 401);
  }

  // Soft delete - deactivate account
  user.isActive = false;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully. You can contact support to reactivate within 30 days.'
  });
});

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('address')
    .lean();

  res.status(200).json({
    success: true,
    data: user.address
  });
});

// @desc    Add/Update address
// @route   PUT /api/users/address
// @access  Private
const updateAddress = asyncHandler(async (req, res, next) => {
  const { street, city, state, country, zipCode } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      address: { street, city, state, country, zipCode }
    },
    { new: true, runValidators: true }
  ).select('address');

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: user.address
  });
});

export {
  // Admin functions
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

  // User profile functions
  getProfile,
  updateProfile,
  changePassword,
  changeEmail,
  uploadAvatar,
  deleteOwnAccount,
  getAddresses,
  updateAddress
};