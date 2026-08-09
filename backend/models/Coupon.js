import mongoose from 'mongoose';

/**
 * Coupon Schema - Discount Coupons & Promo Codes
 * Features: Usage limits, user targeting, minimum purchase
 */
const couponSchema = new mongoose.Schema(
  {
    // ==================== BASIC INFO ====================
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'free_shipping', 'bogo'],
      required: [true, 'Coupon type is required'],
    },
    value: {
      type: Number,
      required: [true, 'Coupon value is required'],
      min: [0, 'Value cannot be negative'],
    },

    // ==================== LIMITATIONS ====================
    minPurchase: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase cannot be negative'],
    },
    maxDiscount: {
      type: Number, // Maximum discount amount (for percentage type)
      min: [0, 'Max discount cannot be negative'],
    },
    maxUsage: {
      total: {
        type: Number,
        min: [0, 'Total usage cannot be negative'],
      },
      perUser: {
        type: Number,
        default: 1,
        min: [1, 'Per user usage must be at least 1'],
      },
      used: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    minItems: {
      type: Number,
      default: 0,
    },

    // ==================== VALIDITY ====================
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ==================== TARGETING ====================
    applicableProducts: {
      type: {
        type: String,
        enum: ['all', 'specific', 'category', 'brand'],
        default: 'all',
      },
      products: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
      categories: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Category',
        },
      ],
      brands: [String],
      excludeProducts: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
      ],
    },
    userEligibility: {
      type: {
        type: String,
        enum: ['all', 'new_users', 'specific_users', 'vip'],
        default: 'all',
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    firstOrderOnly: {
      type: Boolean,
      default: false,
    },

    // ==================== USAGE TRACKING ====================
    usedBy: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        orderId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Order',
        },
        usedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ==================== COMBINABILITY ====================
    isCombinable: {
      type: Boolean,
      default: false, // Can be used with other coupons?
    },
    combinableWith: [String], // Specific coupon codes it can combine with

    // ==================== DISPLAY ====================
    showOnStore: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    badge: {
      type: String, // e.g., "Hot Deal", "New User", "Flash Sale"
    },

    // ==================== ADMIN ====================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
couponSchema.index({ type: 1 });

// ==================== VIRTUALS ====================
couponSchema.virtual('isExpired').get(function () {
  return new Date() > this.endDate;
});

couponSchema.virtual('isExhausted').get(function () {
  return (
    this.maxUsage.total &&
    this.maxUsage.used >= this.maxUsage.total
  );
});

couponSchema.virtual('discountString').get(function () {
  if (this.type === 'percentage') {
    return `${this.value}% OFF`;
  } else if (this.type === 'fixed') {
    return `₹${this.value} OFF`;
  } else if (this.type === 'free_shipping') {
    return 'FREE SHIPPING';
  }
  return '';
});

// ==================== STATIC METHODS ====================
// Validate and apply coupon
couponSchema.statics.validateCoupon = async function (
  code,
  userId,
  orderAmount,
  productIds = []
) {
  const coupon = await this.findOne({
    code: code.toUpperCase(),
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  });

  if (!coupon) {
    throw new Error('Invalid or expired coupon code');
  }

  // Check total usage limit
  if (coupon.maxUsage.total && coupon.maxUsage.used >= coupon.maxUsage.total) {
    throw new Error('Coupon usage limit reached');
  }

  // Check per user usage
  if (userId) {
    const userUsage = coupon.usedBy.filter(
      (u) => u.userId.toString() === userId.toString()
    ).length;

    if (userUsage >= coupon.maxUsage.perUser) {
      throw new Error('You have already used this coupon');
    }
  }

  // Check minimum purchase
  if (orderAmount < coupon.minPurchase) {
    throw new Error(
      `Minimum purchase of ₹${coupon.minPurchase} required`
    );
  }

  // Check product applicability
  if (coupon.applicableProducts.type === 'specific') {
    const hasValidProduct = productIds.some((id) =>
      coupon.applicableProducts.products.some(
        (p) => p.toString() === id.toString()
      )
    );
    if (!hasValidProduct) {
      throw new Error('Coupon not applicable on these products');
    }
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (orderAmount * coupon.value) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
  }

  return { coupon, discount };
};

// ==================== INSTANCE METHODS ====================
// Apply coupon (track usage)
couponSchema.methods.applyCoupon = async function (userId, orderId) {
  this.usedBy.push({ userId, orderId });
  this.maxUsage.used += 1;
  return this.save();
};

// Check if valid for user
couponSchema.methods.isValidForUser = async function (userId) {
  if (this.userEligibility.type === 'all') return true;

  if (this.userEligibility.type === 'new_users') {
    const Order = mongoose.model('Order');
    const orderCount = await Order.countDocuments({ userId });
    return orderCount === 0;
  }

  if (this.userEligibility.type === 'specific_users') {
    return this.userEligibility.users.some(
      (u) => u.toString() === userId.toString()
    );
  }

  return false;
};

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;