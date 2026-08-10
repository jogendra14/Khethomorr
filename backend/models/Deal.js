import mongoose from 'mongoose';

/**
 * Deal/Offer Schema - Promotional Deals & Offers Management
 * Features: Discount types, validity, targeting, usage limits
 */
const dealSchema = new mongoose.Schema(
  {
    // ==================== BASIC INFO ====================
    title: {
      type: String,
      required: [true, 'Deal title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    brand: {
      type: String,
      trim: true,
    },

    // ==================== MEDIA ====================
    image: {
      url: {
        type: String,
        required: [true, 'Deal image is required'],
      },
      alt: {
        type: String,
        default: 'Deal image',
      },
    },
    banner: {
      type: String, // Optional large banner for hero section
    },
    thumbnail: {
      type: String, // Small thumbnail for cards
    },

    // ==================== PRICING ====================
    originalPrice: {
      type: Number,
      required: [true, 'Original price is required'],
      min: [0, 'Price cannot be negative'],
    },
    dealPrice: {
      type: Number,
      required: [true, 'Deal price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function (value) {
          return value < this.originalPrice;
        },
        message: 'Deal price must be less than original price',
      },
    },
    discountType: {
      type: String,
      enum: ['percentage', 'fixed', 'bundle', 'bogo'],
      default: 'percentage',
    },
    discountValue: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
    },

    // ==================== VALIDITY ====================
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      validate: {
        validator: function (value) {
          return value >= new Date();
        },
        message: 'Start date must be in the future',
      },
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

    // ==================== PRODUCT INFO ====================
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      validate: {
        validator: async function (value) {
          if (!value) return true; // Optional
          const Product = mongoose.model('Product');
          const product = await Product.findById(value);
          return product !== null;
        },
        message: 'Product does not exist',
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // ==================== USAGE LIMITS ====================
    usageLimit: {
      total: {
        type: Number, // Total times this deal can be used
        min: [0, 'Total limit cannot be negative'],
      },
      perUser: {
        type: Number, // Times per user
        default: 1,
        min: [1, 'Per user limit must be at least 1'],
      },
      used: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    couponCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },

    // ==================== TARGETING ====================
    priority: {
      type: Number,
      default: 0, // Higher number = higher priority
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    targetAudience: {
      newUsersOnly: {
        type: Boolean,
        default: false,
      },
      minOrderValue: {
        type: Number,
        default: 0,
      },
      specificUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    platforms: {
      web: { type: Boolean, default: true },
      mobile: { type: Boolean, default: true },
      app: { type: Boolean, default: true },
    },

    // ==================== STATUS ====================
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'paused', 'expired', 'cancelled'],
        message: '{VALUE} is not a valid status',
      },
      default: 'draft',
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false, // Soft delete
      select: false,
    },

    // ==================== METRICS ====================
    metrics: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      conversions: { type: Number, default: 0 },
      revenue: { type: Number, default: 0 },
    },

    // ==================== ADMIN ====================
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    updatedBy: {
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
dealSchema.index({ status: 1, isActive: 1 });
dealSchema.index({ startDate: 1, endDate: 1 });
dealSchema.index({ priority: -1 });
dealSchema.index({ brand: 1 });
dealSchema.index({ 'metrics.conversions': -1 });

// ==================== VIRTUALS ====================
// Calculate discount percentage
dealSchema.virtual('discountPercentage').get(function () {
  if (this.originalPrice && this.dealPrice) {
    return Math.round(
      ((this.originalPrice - this.dealPrice) / this.originalPrice) * 100
    );
  }
  return 0;
});

// Amount saved
dealSchema.virtual('amountSaved').get(function () {
  return this.originalPrice - this.dealPrice;
});

// Check if deal is currently active
dealSchema.virtual('isCurrentlyActive').get(function () {
  const now = new Date();
  return (
    this.status === 'active' &&
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (!this.usageLimit.total || this.usageLimit.used < this.usageLimit.total)
  );
});

// Time remaining
dealSchema.virtual('timeRemaining').get(function () {
  const now = new Date();
  if (now > this.endDate) return 'Expired';
  const diff = this.endDate - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}d ${hours}h remaining`;
});

// Stock remaining
dealSchema.virtual('stockRemaining').get(function () {
  if (!this.usageLimit.total) return 'Unlimited';
  return Math.max(0, this.usageLimit.total - this.usageLimit.used);
});

// ==================== PRE-SAVE HOOKS ====================
dealSchema.pre('save', function () {
  // Generate slug from title
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Calculate discount value
  if (this.isModified('originalPrice') || this.isModified('dealPrice')) {
    this.discountValue = this.originalPrice - this.dealPrice;
  }

  // Auto-expire past deals
  if (this.endDate && this.endDate < new Date() && this.status === 'active') {
    this.status = 'expired';
  }

});

// ==================== STATIC METHODS ====================
// Get active deals
dealSchema.statics.getActiveDeals = async function (options = {}) {
  const { page = 1, limit = 10, brand, category } = options;

  const query = {
    status: 'active',
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  };

  if (brand) query.brand = brand;
  if (category) query.category = category;

  const skip = (page - 1) * limit;

  const [deals, total] = await Promise.all([
    this.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
  ]);

  return {
    deals,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

// Get featured deals
dealSchema.statics.getFeaturedDeals = async function (limit = 6) {
  return this.find({
    status: 'active',
    isActive: true,
    isFeatured: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() },
  })
    .sort({ priority: -1 })
    .limit(limit)
    .lean();
};

// ==================== INSTANCE METHODS ====================
// Track deal view
dealSchema.methods.trackView = async function () {
  this.metrics.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Track deal click
dealSchema.methods.trackClick = async function () {
  this.metrics.clicks += 1;
  return this.save({ validateBeforeSave: false });
};

// Track conversion
dealSchema.methods.trackConversion = async function (amount) {
  this.metrics.conversions += 1;
  this.metrics.revenue += amount;
  if (this.usageLimit.total) {
    this.usageLimit.used += 1;
  }
  return this.save({ validateBeforeSave: false });
};

// Pause deal
dealSchema.methods.pause = async function () {
  if (this.status !== 'active') {
    throw new Error('Only active deals can be paused');
  }
  this.status = 'paused';
  return this.save();
};

// Activate deal
dealSchema.methods.activate = async function () {
  if (this.status === 'expired' && this.endDate < new Date()) {
    throw new Error('Cannot activate an expired deal');
  }
  this.status = 'active';
  return this.save();
};

// ==================== ERROR HANDLING ====================
dealSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    if (field === 'couponCode') {
      next(new Error('This coupon code already exists'));
    } else {
      next(new Error(`${field} already exists`));
    }
  } else {
    next(error);
  }
});

const Deal = mongoose.model('Deal', dealSchema);
export default Deal;