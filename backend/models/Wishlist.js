import mongoose from 'mongoose';

/**
 * Wishlist Schema - User's saved products
 * Features: Multiple wishlists, sharing, move to cart
 */
const wishlistSchema = new mongoose.Schema(
  {
    // ==================== USER INFO ====================
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      default: 'My Wishlist',
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },

    // ==================== PRODUCTS ====================
    products: [
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
        },
        image: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
          maxlength: [200, 'Note cannot exceed 200 characters'],
        },
        priority: {
          type: Number,
          default: 0, // For sorting within wishlist
        },
      },
    ],

    // ==================== SETTINGS ====================
    isPublic: {
      type: Boolean,
      default: false, // Can be shared with others
    },
    sharedWith: [
      {
        email: String,
        sharedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notificationSettings: {
      priceDrop: {
        type: Boolean,
        default: true, // Notify when price drops
      },
      backInStock: {
        type: Boolean,
        default: true, // Notify when back in stock
      },
      dealStart: {
        type: Boolean,
        default: false, // Notify when deal starts
      },
    },

    // ==================== STATUS ====================
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ==================== INDEXES ====================
wishlistSchema.index({ userId: 1, name: 1 });
wishlistSchema.index({ 'products.productId': 1 });
wishlistSchema.index({ isDefault: 1 });

// ==================== VIRTUALS ====================
wishlistSchema.virtual('totalProducts').get(function () {
  return this.products.length;
});

wishlistSchema.virtual('totalValue').get(function () {
  return this.products.reduce((total, product) => total + product.price, 0);
});

// ==================== PRE-SAVE HOOKS ====================
wishlistSchema.pre('save', async function () {
  // Ensure only one default wishlist per user
  if (this.isDefault) {
    await this.constructor.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
});

// ==================== STATIC METHODS ====================
// Get user's wishlists
wishlistSchema.statics.getUserWishlists = async function (userId) {
  return this.find({ userId, isActive: true })
    .sort({ isDefault: -1, updatedAt: -1 })
    .lean();
};

// Get default wishlist
wishlistSchema.statics.getDefaultWishlist = async function (userId) {
  let wishlist = await this.findOne({
    userId,
    isDefault: true,
    isActive: true,
  });

  if (!wishlist) {
    wishlist = new this({
      userId,
      name: 'My Wishlist',
      isDefault: true,
    });
    await wishlist.save();
  }

  return wishlist;
};

// ==================== INSTANCE METHODS ====================
// Add product to wishlist
wishlistSchema.methods.addProduct = async function (productData) {
  const { productId, name, price, image, note } = productData;

  // Check if product already exists
  const existingProduct = this.products.find(
    (p) => p.productId.toString() === productId.toString()
  );

  if (existingProduct) {
    throw new Error('Product already in wishlist');
  }

  this.products.push({
    productId,
    name,
    price,
    image,
    note,
  });

  return this.save();
};

// Remove product from wishlist
wishlistSchema.methods.removeProduct = async function (productId) {
  this.products = this.products.filter(
    (p) => p.productId.toString() !== productId.toString()
  );
  return this.save();
};

// Check if product exists
wishlistSchema.methods.hasProduct = function (productId) {
  return this.products.some(
    (p) => p.productId.toString() === productId.toString()
  );
};

// Move to cart
wishlistSchema.methods.moveToCart = async function (productId, cart) {
  const product = this.products.find(
    (p) => p.productId.toString() === productId.toString()
  );

  if (!product) throw new Error('Product not found in wishlist');

  // Add to cart
  await cart.addItem({
    productId: product.productId,
    name: product.name,
    price: product.price,
    image: product.image,
  });

  // Remove from wishlist
  await this.removeProduct(productId);

  return cart;
};

// Share wishlist
wishlistSchema.methods.shareWithEmail = async function (email) {
  if (!this.isPublic) {
    this.isPublic = true;
  }

  this.sharedWith.push({ email });
  return this.save();
};

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;