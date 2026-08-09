import mongoose from 'mongoose';

/**
 * Cart Schema - Shopping Cart Management
 * Users ke cart items store karega, guest users ke liye bhi support
 */
const cartSchema = new mongoose.Schema(
  {
    // ==================== USER INFO ====================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true, // One cart per user
      sparse: true, // Allow null for guest users
      validate: {
        validator: async function (value) {
          if (!value) return true;
          const User = mongoose.model('User');
          const user = await User.findById(value);
          return user !== null;
        },
        message: 'User does not exist',
      },
    },
    sessionId: {
      type: String, // Guest users ke liye session ID
      unique: true,
      sparse: true,
      index: true,
    },

    // ==================== CART ITEMS ====================
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Product ID is required'],
        },
        name: {
          type: String,
          required: [true, 'Product name is required'],
        },
        price: {
          type: Number,
          required: [true, 'Price is required'],
          min: [0, 'Price cannot be negative'],
        },
        quantity: {
          type: Number,
          required: [true, 'Quantity is required'],
          min: [1, 'Quantity must be at least 1'],
          default: 1,
          validate: {
            validator: Number.isInteger,
            message: 'Quantity must be a whole number',
          },
        },
        image: String, // Product image for display
        variant: {
          variantId: String,
          name: String, // e.g., "Color: Red, Size: XL"
          sku: String,
        },
        subtotal: {
          type: Number,
          default: 0,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // ==================== FINANCIAL INFO ====================
    subtotal: {
      type: Number,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },

    // ==================== APPLIED COUPON ====================
    coupon: {
      code: String,
      discount: Number,
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
    },

    // ==================== STATUS ====================
    status: {
      type: String,
      enum: ['active', 'abandoned', 'converted', 'expired'],
      default: 'active',
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },

    // ==================== NOTES ====================
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
cartSchema.index({ status: 1 });
cartSchema.index({ lastActivity: 1 });

// ==================== VIRTUALS ====================
// Total items count
cartSchema.virtual('totalItems').get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Check if cart is empty
cartSchema.virtual('isEmpty').get(function () {
  return this.items.length === 0;
});

// ==================== PRE-SAVE HOOKS ====================
cartSchema.pre('save', function (next) {
  // Calculate subtotal for each item
  this.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
  });

  // Calculate cart subtotal
  this.subtotal = this.items.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  // Calculate total
  this.totalAmount = this.subtotal + this.tax + this.shippingCost - this.discount;

  // Update last activity
  this.lastActivity = new Date();

  next();
});

// ==================== STATIC METHODS ====================
// Find or create cart for user
cartSchema.statics.findOrCreateCart = async function (userId, sessionId) {
  let cart;

  if (userId) {
    cart = await this.findOne({ userId, status: 'active' });
    if (cart) return cart;
  }

  if (sessionId) {
    cart = await this.findOne({ sessionId, status: 'active' });
    if (cart) return cart;
  }

  // Create new cart
  cart = new this({ userId, sessionId });
  await cart.save();
  return cart;
};

// Clean abandoned carts (older than 30 days)
cartSchema.statics.cleanAbandonedCarts = async function () {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.updateMany(
    {
      status: 'active',
      lastActivity: { $lt: thirtyDaysAgo },
      userId: { $exists: false }, // Only guest carts
    },
    { status: 'expired' }
  );
};

// ==================== INSTANCE METHODS ====================
// Add item to cart
cartSchema.methods.addItem = async function (productData) {
  const { productId, variant, quantity = 1 } = productData;

  // Check if product already in cart
  const existingItem = this.items.find((item) => {
    if (variant?.variantId) {
      return (
        item.productId.toString() === productId.toString() &&
        item.variant?.variantId === variant.variantId
      );
    }
    return item.productId.toString() === productId.toString() && !item.variant?.variantId;
  });

  if (existingItem) {
    // Update quantity
    existingItem.quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      productId,
      name: productData.name,
      price: productData.price,
      quantity,
      image: productData.image,
      variant,
    });
  }

  return this.save();
};

// Remove item from cart
cartSchema.methods.removeItem = async function (itemId) {
  this.items = this.items.filter((item) => item._id.toString() !== itemId.toString());
  return this.save();
};

// Update item quantity
cartSchema.methods.updateItemQuantity = async function (itemId, quantity) {
  const item = this.items.find((item) => item._id.toString() === itemId.toString());
  if (!item) throw new Error('Item not found in cart');

  if (quantity <= 0) {
    return this.removeItem(itemId);
  }

  item.quantity = quantity;
  return this.save();
};

// Clear cart
cartSchema.methods.clearCart = async function () {
  this.items = [];
  this.coupon = undefined;
  this.subtotal = 0;
  this.totalAmount = 0;
  return this.save();
};

// Apply coupon
cartSchema.methods.applyCoupon = async function (couponCode, discount, type) {
  this.coupon = {
    code: couponCode,
    discount,
    type,
  };

  if (type === 'percentage') {
    this.discount = (this.subtotal * discount) / 100;
  } else {
    this.discount = discount;
  }

  return this.save();
};

// Remove coupon
cartSchema.methods.removeCoupon = async function () {
  this.coupon = undefined;
  this.discount = 0;
  return this.save();
};

// Merge guest cart with user cart
cartSchema.methods.mergeWithUserCart = async function (userCart) {
  this.items.forEach((item) => {
    const existingItem = userCart.items.find((userItem) => {
      if (item.variant?.variantId) {
        return (
          userItem.productId.toString() === item.productId.toString() &&
          userItem.variant?.variantId === item.variant.variantId
        );
      }
      return (
        userItem.productId.toString() === item.productId.toString() &&
        !userItem.variant?.variantId
      );
    });

    if (existingItem) {
      existingItem.quantity = Math.max(existingItem.quantity, item.quantity);
    } else {
      userCart.items.push(item);
    }
  });

  await userCart.save();
  this.status = 'converted';
  await this.save();

  return userCart;
};

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;