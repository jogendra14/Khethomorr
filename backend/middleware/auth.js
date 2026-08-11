import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

// Protect routes - User must be logged in
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header or cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // From Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    // From cookie
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    throw new AppError('Please log in to access this resource', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('+passwordChangedAt');

    if (!user) {
      throw new AppError('User belonging to this token no longer exists', 401);
    }

    // Check if user changed password after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      throw new AppError('Password recently changed. Please log in again', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support', 403);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token. Please log in again', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired. Please log in again', 401);
    }
    throw error;
  }
});

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError(
        "You must be logged in to access this resource",
        401
      );
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Role '${req.user.role}' is not authorized to access this resource`,
        403
      );
    }

    next();
  };
};

// Optional auth - Attach user if token exists, but don't require it
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid - continue without user
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
});

// Check email verified
export const requireEmailVerified = asyncHandler(async (req, res, next) => {
  if (!req.user.isEmailVerified) {
    throw new AppError('Please verify your email address first', 403);
  }
  next();
});

// Rate limiting helper (simple version)
const requestCounts = new Map();

export const rateLimiter = (maxRequests = 10, windowMs = 60 * 1000) => {
  return (req, res, next) => {
    const key = req.ip + req.originalUrl;
    const now = Date.now();

    if (!requestCounts.has(key)) {
      requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    } else {
      const record = requestCounts.get(key);
      if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + windowMs;
      } else if (record.count >= maxRequests) {
        throw new AppError('Too many requests. Please try again later', 429);
      } else {
        record.count++;
      }
    }

    next();
  };
};