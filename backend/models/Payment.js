import mongoose from 'mongoose';

/**
 * Payment Schema - Payment Transaction Records
 * Tracks all payment attempts, refunds, and transaction history
 */
const paymentSchema = new mongoose.Schema(
  {
    // ==================== REFERENCES ====================
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // ==================== PAYMENT INFO ====================
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
      uppercase: true,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'UPI', 'Card', 'NetBanking', 'Wallet', 'EMI'],
      required: [true, 'Payment method is required'],
    },
    paymentGateway: {
      type: String,
      enum: ['Razorpay', 'Stripe', 'PayPal', 'PhonePe', 'GooglePay'],
      default: 'Razorpay',
    },

    // ==================== TRANSACTION DETAILS ====================
    gatewayTransactionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    gatewayOrderId: String,
    gatewayPaymentId: String,
    gatewaySignature: String, // For verification

    // ==================== PAYMENT STATUS ====================
    status: {
      type: String,
      enum: {
        values: [
          'initiated',
          'processing',
          'completed',
          'failed',
          'refunded',
          'partially_refunded',
          'cancelled',
        ],
        message: '{VALUE} is not a valid status',
      },
      default: 'initiated',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ==================== REFUND INFO ====================
    refund: {
      refundId: String,
      amount: Number,
      reason: String,
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
      },
      initiatedAt: Date,
      completedAt: Date,
      gatewayRefundId: String,
    },

    // ==================== ADDITIONAL INFO ====================
    paymentDetails: {
      cardNetwork: String, // Visa, Mastercard, etc.
      cardLast4: String,
      bankName: String,
      upiId: String,
      walletProvider: String,
    },
    receiptUrl: String, // Payment receipt URL
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    // ==================== ERROR HANDLING ====================
    errorDetails: {
      code: String,
      description: String,
      source: String,
      step: String,
      reason: String,
    },

    // ==================== METADATA ====================
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // Gateway-specific data
    },
    ipAddress: String,
    userAgent: String,
    isInternational: {
      type: Boolean,
      default: false,
    },

    // ==================== TIMESTAMPS ====================
    initiatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    failedAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ orderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ paymentMethod: 1 });

// ==================== VIRTUALS ====================
paymentSchema.virtual('isRefundable').get(function () {
  return (
    this.status === 'completed' &&
    !this.refund?.status &&
    this.paymentMethod !== 'COD'
  );
});

paymentSchema.virtual('paymentAge').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// ==================== STATIC METHODS ====================
// Get payment statistics
paymentSchema.statics.getStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
      },
    },
  ]);
  return stats;
};

// ==================== INSTANCE METHODS ====================
// Update payment status
paymentSchema.methods.updateStatus = async function (status, details = {}) {
  this.status = status;

  if (status === 'completed') {
    this.completedAt = new Date();
    this.isVerified = true;
  } else if (status === 'failed') {
    this.failedAt = new Date();
    this.errorDetails = { ...this.errorDetails, ...details };
  }

  return this.save();
};

// Process refund
paymentSchema.methods.processRefund = async function (amount, reason) {
  if (!this.isRefundable) {
    throw new Error('Payment is not refundable');
  }

  this.refund = {
    amount: amount || this.amount,
    reason,
    status: 'pending',
    initiatedAt: new Date(),
  };

  this.status = 'partially_refunded';
  return this.save();
};

// Complete refund
paymentSchema.methods.completeRefund = async function (gatewayRefundId) {
  if (!this.refund) {
    throw new Error('No refund initiated');
  }

  this.refund.status = 'completed';
  this.refund.completedAt = new Date();
  this.refund.gatewayRefundId = gatewayRefundId;
  this.status = 'refunded';

  return this.save();
};

// Generate invoice
paymentSchema.methods.generateInvoice = async function () {
  if (!this.invoiceNumber) {
    const timestamp = Date.now().toString().slice(-8);
    this.invoiceNumber = `INV${timestamp}`;
    await this.save();
  }
  return this.invoiceNumber;
};

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;