import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';

/**
 * ============================================
 * AUTH CONTROLLER - Complete Authentication System
 * ============================================
 * Features: Login, Register, Email Verification,
 * Password Reset, Token Refresh, Logout
 */

// ==================== HELPER FUNCTIONS ====================

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '15m' // Short-lived access token
    }
  );
};

// Send token response - Now properly async
const sendTokenResponse = async (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user);
  const refreshToken = user.generateRefreshToken();

  // Save refresh token to DB
  user.refreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex');
  user.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  user.lastLogin = new Date();
  
  // ✅ Await the save operation
  await user.save({ validateBeforeSave: false });

  // Don't mutate the user object - construct response separately
  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    isEmailVerified: user.isEmailVerified,
    lastLogin: user.lastLogin,
    address: user.address
  };

  res.status(statusCode).json({
    success: true,
    message,
    data: {
      user: userResponse,
      token,
      refreshToken,
      expiresIn: process.env.JWT_EXPIRE || '15m'
    }
  });
};

// ==================== REGISTER ====================

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // Validate input
  if (!name || !email || !password) {
    throw new AppError('Please provide name, email and password', 400);
  }

  // Validate password strength
  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Check if user exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new AppError('An account with this email already exists', 400);
  }

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    phone: phone?.trim(),
    role: 'user', // Always create as regular user
    isEmailVerified: false
  });

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Welcome! Please Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to Our Store, ${user.name}! 🎉</h2>
          <p>Thank you for registering. Please verify your email address to get started.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4CAF50; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link in your browser:<br>
            ${verificationUrl}
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours.
          </p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.log('Verification email failed to send:', error.message);
    // Don't throw error, user can still login and request new verification
  }

  await sendTokenResponse(user, 201, res, 'Registration successful! Please check your email to verify your account.');
});

// ==================== LOGIN ====================

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Find user with password
  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select('+password +loginAttempts +lockUntil +refreshToken');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check if account is locked
  if (user.isAccountLocked()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw new AppError(
      `Account is locked due to too many failed attempts. Please try again in ${minutesLeft} minutes.`,
      423
    );
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError(
      'Your account has been deactivated. Please contact support for assistance.',
      403
    );
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    // Increment login attempts
    await user.incrementLoginAttempts();

    const attemptsLeft = 5 - (user.loginAttempts + 1);
    throw new AppError(
      `Invalid email or password. ${attemptsLeft > 0 ? `${attemptsLeft} attempts remaining.` : 'Account locked for 30 minutes.'}`,
      401
    );
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    user.loginAttempts = 0;
    user.lockUntil = undefined;
  }

  await sendTokenResponse(user, 200, res, 'Login successful');
});

// ==================== EMAIL VERIFICATION ====================

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;

  // Hash the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Invalid or expired verification token. Please request a new one.', 400);
  }

  // Verify email
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now log in.'
  });
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerificationEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide your email address', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) {
    throw new AppError('No account found with this email', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // Generate new verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Send verification email
  try {
    const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <h2>Email Verification</h2>
        <p>Hello ${user.name},</p>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.'
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError('Failed to send verification email. Please try again later.', 500);
  }
});

// ==================== FORGOT PASSWORD ====================

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new AppError('Please provide your email address', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Always return success even if user not found (security best practice)
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate reset token
  const resetToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send reset email
  try {
    const resetUrl = `${process.env.CLIENT_URL || req.protocol + '://' + req.get('host')}/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #2196F3; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 5px; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link in your browser:<br>
            ${resetUrl}
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 30 minutes.
          </p>
          <hr style="border: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">
            If you didn't request this, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
      `
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.'
    });
  } catch (error) {
    // Clear reset token if email fails
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError('Failed to send reset email. Please try again later.', 500);
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new AppError('Please provide a new password', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Hash the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // Find user with valid token
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token. Please request a new one.', 400);
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  // Send confirmation email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Changed Successfully',
      html: `
        <h2>Password Changed</h2>
        <p>Hello ${user.name},</p>
        <p>Your password has been changed successfully.</p>
        <p>If you didn't make this change, please contact our support team immediately.</p>
      `
    });
  } catch (error) {
    console.log('Password change notification email failed:', error.message);
  }

  await sendTokenResponse(user, 200, res, 'Password reset successful! You are now logged in.');
});

// ==================== TOKEN MANAGEMENT ====================

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError('Refresh token is required', 400);
  }

  // Hash the provided token
  const hashedToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  // Find user with valid refresh token
  const user = await User.findOne({
    refreshToken: hashedToken,
    refreshTokenExpire: { $gt: Date.now() },
    isActive: true
  });

  if (!user) {
    throw new AppError('Invalid or expired refresh token. Please login again.', 401);
  }

  // Generate new tokens
  const newToken = generateToken(user);
  const newRefreshToken = user.generateRefreshToken();

  user.refreshToken = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
  user.refreshTokenExpire = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    data: {
      token: newToken,
      refreshToken: newRefreshToken,
      expiresIn: process.env.JWT_EXPIRE || '15m'
    }
  });
});

// ==================== GET CURRENT USER ====================

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .select('-password -refreshToken -__v -loginAttempts -lockUntil');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// ==================== UPDATE PASSWORD (LOGGED IN) ====================

// @desc    Update password (logged in user)
// @route   PUT /api/auth/update-password
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters', 400);
  }

  if (currentPassword === newPassword) {
    throw new AppError('New password must be different from current password', 400);
  }

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Send confirmation email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Changed',
      message: 'Your password has been changed successfully. If you did not make this change, please contact support immediately.'
    });
  } catch (error) {
    console.log('Password change notification failed:', error.message);
  }

  // Generate new token
  await sendTokenResponse(user, 200, res, 'Password updated successfully');
});

// ==================== LOGOUT ====================

// @desc    Logout user / clear refresh token
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (user) {
    user.refreshToken = undefined;
    user.refreshTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

export {
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
};