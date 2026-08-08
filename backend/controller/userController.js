// controllers/userController.js
import User from '../models/User.js';
import mongoose from 'mongoose';
import crypto from 'crypto';
import  sendEmail  from '../utils/sendEmail.js'; // Optional - agar email send karna hai

// ============================================
// ✅ GET ALL USERS (Admin & SuperAdmin Only)
// ============================================
export const getAllUsers = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filters
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Sort
    const sort = {};
    if (req.query.sortBy) {
      sort[req.query.sortBy] = req.query.order === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const users = await User.find(filter)
      .select('-password -refreshToken -__v')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// ============================================
// ✅ GET SINGLE USER (Admin & SuperAdmin Only)
// ============================================
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// ============================================
// ✅ UPDATE USER (Admin & SuperAdmin Only)
// ============================================
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive, isEmailVerified, phone, address } = req.body;

    // Check if email already exists (if email is being changed)
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) {
      // Only allow valid roles
      if (!['user', 'vendor', 'admin', 'superadmin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }
      updateData.role = role;
    }
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isEmailVerified !== undefined) updateData.isEmailVerified = isEmailVerified;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -refreshToken -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// ============================================
// ✅ DELETE USER (Admin & SuperAdmin Only)
// ============================================
export const deleteUser = async (req, res) => {
  try {
    // Prevent deleting self
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// ============================================
// ✅ TOGGLE USER STATUS (Admin & SuperAdmin Only)
// ============================================
export const toggleUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    // Prevent deactivating self
    if (!isActive && req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password -refreshToken -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle user status',
      error: error.message
    });
  }
};

// ============================================
// ✅ UPDATE USER ROLE (Admin & SuperAdmin Only)
// ============================================
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    if (!['user', 'vendor', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Allowed: user, vendor, admin, superadmin'
      });
    }

    // Prevent changing own role (optional - security)
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -refreshToken -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

// ============================================
// ✅ GET ALL VENDORS (Admin & SuperAdmin Only)
// ============================================
export const getAllVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { role: 'vendor' };
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const vendors = await User.find(filter)
      .select('-password -refreshToken -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: vendors.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: vendors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors',
      error: error.message
    });
  }
};

// ============================================
// ✅ GET ALL ADMINS (SuperAdmin Only)
// ============================================
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({
      role: { $in: ['admin', 'superadmin'] }
    }).select('-password -refreshToken -__v');

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: error.message
    });
  }
};

// ============================================
// ✅ GET USER STATISTICS (Admin & SuperAdmin Only)
// ============================================
export const getUserStatistics = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        newUsersToday,
        roleDistribution: stats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
};

// ============================================
// ✅ GET CURRENT USER PROFILE (All Authenticated Users)
// ============================================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshToken -__v');

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// ============================================
// ✅ UPDATE PROFILE (Authenticated User - Own Profile)
// ============================================
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;

    // User cannot change role, email, or status from here
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (avatar) updateData.avatar = avatar;

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

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// ============================================
// ✅ UPLOAD AVATAR (Authenticated User)
// ============================================
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const avatarUrl = req.file.path || req.file.location; // Depending on upload middleware

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    ).select('-password -refreshToken -__v');

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar',
      error: error.message
    });
  }
};

// ============================================
// ✅ DELETE OWN ACCOUNT (Authenticated User)
// ============================================
export const deleteOwnAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
};

// ============================================
// ✅ BULK DELETE USERS (Admin & SuperAdmin Only)
// ============================================
export const bulkDeleteUsers = async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of user IDs'
      });
    }

    // Prevent deleting self
    const filteredIds = userIds.filter(id => id !== req.user._id.toString());

    const result = await User.deleteMany({
      _id: { $in: filteredIds }
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} users deleted successfully`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete users',
      error: error.message
    });
  }
};

// ============================================
// ✅ EXPORT USERS (Admin & SuperAdmin Only)
// ============================================
export const exportUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name email role isActive isEmailVerified createdAt')
      .lean();

    // Convert to CSV format or JSON
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export users',
      error: error.message
    });
  }
};