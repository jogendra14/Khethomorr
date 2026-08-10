import mongoose from 'mongoose';

/**
 * Review Schema - Product Review & Rating System
 * Features: Verified purchases, helpful votes, image uploads
 */
const reviewSchema = new mongoose.Schema(
  {
    // ==================== REFERENCES ====================
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
      validate: {
        validator: async function (value) {
          const Product = mongoose.model('Product');
          const product = await Product.findById(value);
          return product !== null;
        },
        message: 'Product does not exist',
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
      validate: {
        validator: async function (value) {
          const User = mongoose.model('User');
          const user = await User.findById(value);
          return user !== null;
        },
        message: 'User does not exist',
      },
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order', // Track which order this review is for
    },

    // ==================== USER INFO ====================
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    userAvatar: {
      type: String, // Store user avatar URL
    },

    // ==================== REVIEW CONTENT ====================
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must be at most 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a whole number',
      },
    },
    title: {
      type: String,
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      minlength: [10, 'Review must be at least 10 characters'],
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
    },

    // ==================== PROS & CONS ====================
    pros: [
      {
        type: String,
        trim: true,
        maxlength: [100, 'Pro cannot exceed 100 characters'],
      },
    ],
    cons: [
      {
        type: String,
        trim: true,
        maxlength: [100, 'Con cannot exceed 100 characters'],
      },
    ],

    // ==================== MEDIA ====================
    images: [
      {
        url: String,
        caption: String,
      },
    ],

    // ==================== VERIFICATION ====================
    isVerifiedPurchase: {
      type: Boolean,
      default: false, // Will be set to true if user bought this product
    },
    isEdited: {
      type: Boolean,
      default: false,
    },

    // ==================== ENGAGEMENT ====================
    helpful: {
      count: {
        type: Number,
        default: 0,
      },
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    reported: {
      count: {
        type: Number,
        default: 0,
      },
      reasons: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
          reason: String,
          timestamp: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },

    // ==================== STATUS ====================
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'flagged'],
        message: '{VALUE} is not a valid status',
      },
      default: 'approved', // Auto-approve, change to 'pending' for manual review
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // ==================== ADMIN ====================
    adminReply: {
      comment: String,
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      repliedAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
// Ensure one user can review a product only once
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });
reviewSchema.index({ 'helpful.count': -1 });

// ==================== VIRTUALS ====================
// Rating display (stars)
reviewSchema.virtual('ratingStars').get(function () {
  return '⭐'.repeat(this.rating) + '☆'.repeat(5 - this.rating);
});

// Check if review has media
reviewSchema.virtual('hasImages').get(function () {
  return this.images && this.images.length > 0;
});

// Formatted date
reviewSchema.virtual('reviewDate').get(function () {
  return this.createdAt.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

// ==================== PRE-SAVE HOOKS ====================
reviewSchema.pre('save', async function () {
  try {
    // Check if user has purchased the product
    if (this.isNew || this.isModified('userId')) {
      const Order = mongoose.model('Order');
      const purchase = await Order.findOne({
        userId: this.userId,
        'items.productId': this.productId,
        status: 'Delivered',
      });
      this.isVerifiedPurchase = !!purchase;
      if (purchase) {
        this.orderId = purchase._id;
      }
    }

    // Set isEdited flag on update
    if (!this.isNew && this.isModified('comment')) {
      this.isEdited = true;
    }

    // Auto-populate user details
    if (this.isNew || this.isModified('userId')) {
      const User = mongoose.model('User');
      const user = await User.findById(this.userId);
      if (user) {
        this.userName = user.name;
        this.userAvatar = user.avatar;
      }
    }

  } catch (error) {
    next(error);
  }
});

// ==================== POST-SAVE HOOKS ====================
// Update product rating after review is saved
reviewSchema.post('save', async function () {
  try {
    const Product = mongoose.model('Product');
    const stats = await this.constructor.aggregate([
      {
        $match: {
          productId: this.productId,
          status: 'approved',
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$productId',
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(this.productId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
      });
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
});

// ==================== STATIC METHODS ====================
// Get product reviews with filters
reviewSchema.statics.getProductReviews = async function (
  productId,
  options = {}
) {
  const {
    page = 1,
    limit = 10,
    rating,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    verifiedOnly = false,
  } = options;

  const query = {
    productId,
    status: 'approved',
    isActive: true,
  };

  if (rating) {
    query.rating = rating;
  }

  if (verifiedOnly) {
    query.isVerifiedPurchase = true;
  }

  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const [reviews, total] = await Promise.all([
    this.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
    this.countDocuments(query),
  ]);

  return {
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
      hasMore: skip + limit < total,
    },
  };
};

// Get review statistics for a product
reviewSchema.statics.getRatingStats = async function (productId) {
  const stats = await this.aggregate([
    {
      $match: {
        productId: mongoose.Types.ObjectId(productId),
        status: 'approved',
        isActive: true,
      },
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  stats.forEach((stat) => {
    distribution[stat._id] = stat.count;
  });

  const totalReviews = Object.values(distribution).reduce((a, b) => a + b, 0);
  const averageRating =
    totalReviews > 0
      ? (
          Object.entries(distribution).reduce(
            (sum, [rating, count]) => sum + rating * count,
            0
          ) / totalReviews
        ).toFixed(1)
      : 0;

  return {
    averageRating: parseFloat(averageRating),
    totalReviews,
    distribution,
  };
};

// ==================== INSTANCE METHODS ====================
// Mark review as helpful
reviewSchema.methods.markHelpful = async function (userId) {
  if (this.helpful.users.includes(userId)) {
    throw new Error('You have already marked this review as helpful');
  }

  this.helpful.users.push(userId);
  this.helpful.count += 1;
  return this.save();
};

// Report a review
reviewSchema.methods.reportReview = async function (userId, reason) {
  const alreadyReported = this.reported.reasons.some(
    (r) => r.userId.toString() === userId.toString()
  );

  if (alreadyReported) {
    throw new Error('You have already reported this review');
  }

  this.reported.reasons.push({ userId, reason });
  this.reported.count += 1;

  // Auto-flag if too many reports
  if (this.reported.count >= 5) {
    this.status = 'flagged';
  }

  return this.save();
};

// Add admin reply
reviewSchema.methods.addAdminReply = async function (comment, adminId) {
  this.adminReply = {
    comment,
    repliedBy: adminId,
    repliedAt: new Date(),
  };
  return this.save();
};

// ==================== ERROR HANDLING ====================
reviewSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('You have already reviewed this product. You can edit your existing review.'));
  } else {
    next(error);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;