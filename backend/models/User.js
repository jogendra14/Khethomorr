import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters'],
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'vendor', 'admin', 'superadmin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    passwordChangedAt: Date,
    lastLogin: Date,
    phone: {
      type: String,
      trim: true,
      match: [
        /^[+]?[\d\s-]{10,15}$/,
        'Please provide a valid phone number',
      ],
    },
    avatar: {
      type: String,
      default: 'default-avatar.png',
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    refreshToken: {
      type: String,
      select: false, // Don't expose refresh token in queries
    },
    refreshTokenExpire: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ============================================
// INDEXES
// ============================================
userSchema.index({ role: 1 });

// ============================================
// PRE-SAVE HOOK - Hash Password
// ============================================
userSchema.pre('save', async function (next) {
  // Only run if password is modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12); // Increased to 12 rounds for better security
    this.password = await bcrypt.hash(this.password, salt);

    // Set passwordChangedAt for existing users
    if (!this.isNew) {
      this.passwordChangedAt = new Date(Date.now() - 1000);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ============================================
// INSTANCE METHODS
// ============================================

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = Math.floor(
      this.passwordChangedAt.getTime() / 1000
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Generate JWT Access Token
userSchema.methods.generateToken = function () {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '15m', // Short-lived access token
    }
  );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  const refreshToken = crypto.randomBytes(40).toString('hex');

  this.refreshToken = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  this.refreshTokenExpire = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  return refreshToken;
};

// Generate Password Reset Token
userSchema.methods.generatePasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpire = new Date(
    Date.now() + 30 * 60 * 1000
  );

  return resetToken;
};

// Generate Email Verification Token
userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpire = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  );

  return verificationToken;
};

// Check if account is locked
userSchema.methods.isAccountLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
  // If account is locked and lock period is over, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  // Increment attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account if too many attempts
  if (this.loginAttempts + 1 >= 5) {
    updates.$set = {
      lockUntil: new Date(Date.now() + 30 * 60 * 1000), // Lock for 30 minutes
    };
  }

  return this.updateOne(updates);
};

// ============================================
// ERROR HANDLING
// ============================================
userSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    next(new Error(`${field} already exists. Please use a different ${field}.`));
  } else {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);
export default User;