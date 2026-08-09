import mongoose from 'mongoose';

/**
 * Order Schema - Complete Order Management System
 * Tracks: Order items, payment, shipping, status timeline
 */
const orderSchema = new mongoose.Schema(
  {
    // ==================== USER INFO ====================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
      validate: {
        validator: async function (value) {
          if (!value) return false;
          const User = mongoose.model('User');
          const user = await User.findById(value);
          return user !== null;
        },
        message: 'User does not exist',
      },
    },

    // ==================== ORDER ITEMS ====================
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product ID is required'],
          validate: {
            validator: async function (value) {
              const Product = mongoose.model('Product');
              const product = await Product.findById(value);
              return product !== null;
            },
            message: 'Product does not exist',
          },
        },
        name: {
          type: String,
          required: [true, 'Product name is required'], // Store name for order history
        },
        qty: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
          validate: {
            validator: Number.isInteger,
            message: 'Quantity must be a whole number',
          },
        },
        price: {
          type: Number,
          required: [true, 'Price is required'],
          min: [0, 'Price cannot be negative'],
        },
        image: {
          type: String, // Store product image for order history
        },
        variant: {
          name: String, // e.g., "Color: Red, Size: XL"
          sku: String,
        },
        subtotal: {
          type: Number, // price * qty
        },
      },
    ],

    // ==================== FINANCIAL INFO ====================
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, 'Tax cannot be negative'],
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: [0, 'Shipping cost cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },

    // ==================== SHIPPING ADDRESS ====================
    address: {
      fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters'],
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[+]?[\d\s-]{10,15}$/, 'Please provide a valid phone number'],
      },
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
      },
      apartment: {
        type: String, // Optional - apartment, suite, unit etc.
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      postalCode: {
        type: String,
        required: [true, 'Postal code is required'],
        trim: true,
        match: [/^\d{5,6}$/, 'Please provide a valid postal code'],
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        default: 'India',
        trim: true,
      },
    },

    // ==================== PAYMENT INFO ====================
    paymentId: {
      type: String,
      index: true,
      sparse: true, // Allow null for COD
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['COD', 'Online', 'UPI', 'Card', 'NetBanking', 'Wallet'],
        message: '{VALUE} is not a valid payment method',
      },
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: {
        values: ['Pending', 'Processing', 'Paid', 'Failed', 'Refunded', 'Partially Refunded'],
        message: '{VALUE} is not a valid payment status',
      },
      default: 'Pending',
    },
    paymentDetails: {
      gateway: String, // e.g., 'Razorpay', 'Stripe'
      transactionId: String,
      paidAt: Date,
      refundId: String,
      refundAmount: Number,
      refundedAt: Date,
    },

    // ==================== ORDER STATUS ====================
    status: {
      type: String,
      enum: {
        values: [
          'Pending',
          'Confirmed',
          'Processing',
          'Shipped',
          'In Transit',
          'Out for Delivery',
          'Delivered',
          'Cancelled',
          'Returned',
          'Refunded',
        ],
        message: '{VALUE} is not a valid order status',
      },
      default: 'Pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String, // Optional note about status change
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    cancellationReason: {
      type: String,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
    },
    cancelledAt: Date,

    // ==================== SHIPPING INFO ====================
    trackingNumber: {
      type: String,
      index: true,
      sparse: true,
    },
    shippingCarrier: {
      type: String, // e.g., 'FedEx', 'BlueDart', 'IndiaPost'
    },
    shippedAt: Date,
    deliveredAt: Date,
    estimatedDeliveryDate: Date,

    // ==================== ADDITIONAL INFO ====================
    orderNumber: {
      type: String,
      unique: true,
    },
    notes: {
      type: String,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    isGift: {
      type: Boolean,
      default: false,
    },
    giftMessage: {
      type: String,
      maxlength: [500, 'Gift message cannot exceed 500 characters'],
    },
    couponCode: String,
    couponDiscount: Number,

    // ==================== ADMIN INFO ====================
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
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// ==================== VIRTUALS ====================
// Total items count
orderSchema.virtual('totalItems').get(function () {
  return this.items.reduce((total, item) => total + item.qty, 0);
});

// Check if order can be cancelled
orderSchema.virtual('canCancel').get(function () {
  return ['Pending', 'Confirmed', 'Processing'].includes(this.status);
});

// Check if order is completed
orderSchema.virtual('isCompleted').get(function () {
  return this.status === 'Delivered';
});

// Format created date
orderSchema.virtual('orderDate').get(function () {
  return this.createdAt.toISOString().split('T')[0];
});

// ==================== PRE-SAVE HOOKS ====================
orderSchema.pre('save', async function (next) {
  try {
    // Generate order number on first save
    if (this.isNew) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
      this.orderNumber = `ORD${year}${month}${random}`;
    }

    // Calculate subtotal for each item
    if (this.isModified('items')) {
      this.items.forEach((item) => {
        if (!item.subtotal) {
          item.subtotal = item.price * item.qty;
        }
      });

      // Calculate order subtotal
      this.subtotal = this.items.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );

      // Calculate total
      this.totalAmount =
        this.subtotal + this.tax + this.shippingCost - this.discount;
    }

    // Track status changes
    if (this.isModified('status')) {
      this.statusHistory.push({
        status: this.status,
        timestamp: new Date(),
        updatedBy: this.updatedBy,
      });

      // Set timestamps based on status
      if (this.status === 'Shipped') {
        this.shippedAt = new Date();
      } else if (this.status === 'Delivered') {
        this.deliveredAt = new Date();
        this.paymentStatus = 'Paid'; // Auto-update payment status
      } else if (this.status === 'Cancelled') {
        this.cancelledAt = new Date();
      }
    }

    // Validate COD orders max amount (example: ₹50,000 limit)
    if (
      this.paymentMethod === 'COD' &&
      this.totalAmount > 50000
    ) {
      throw new Error('COD is not available for orders above ₹50,000');
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ==================== STATIC METHODS ====================
// Get order statistics
orderSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
      },
    },
  ]);
  return stats;
};

// Get user order summary
orderSchema.statics.getUserOrderSummary = async function (userId) {
  const summary = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalAmount' },
        lastOrderDate: { $max: '$createdAt' },
      },
    },
  ]);
  return summary[0] || { totalOrders: 0, totalSpent: 0 };
};

// ==================== INSTANCE METHODS ====================
// Cancel order
orderSchema.methods.cancel = async function (reason, userId) {
  if (!this.canCancel) {
    throw new Error('This order cannot be cancelled');
  }

  this.status = 'Cancelled';
  this.cancellationReason = reason;
  this.updatedBy = userId;

  return this.save();
};

// Update payment status
orderSchema.methods.updatePayment = async function (status, details = {}) {
  this.paymentStatus = status;
  if (details.transactionId) {
    this.paymentDetails.transactionId = details.transactionId;
  }
  if (status === 'Paid') {
    this.paymentDetails.paidAt = new Date();
    if (this.status === 'Pending') {
      this.status = 'Confirmed'; // Auto-confirm on payment
    }
  }
  return this.save();
};

// Add tracking information
orderSchema.methods.addTracking = async function (trackingNumber, carrier) {
  this.trackingNumber = trackingNumber;
  this.shippingCarrier = carrier;
  if (this.status === 'Processing') {
    this.status = 'Shipped';
  }
  return this.save();
};

// ==================== ERROR HANDLING ====================
orderSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    next(new Error('Duplicate order number. Please try again.'));
  } else {
    next(error);
  }
});

const Order = mongoose.model('Order', orderSchema);
export default Order;