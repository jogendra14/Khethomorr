import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
      minlength: [2, 'Product name must be at least 2 characters'],
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
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
      default: '',
    },

    // Pricing
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
      validate: {
        validator: function (v) {
          return !isNaN(v) && v >= 0;
        },
        message: 'Please enter a valid price',
      },
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare at price cannot be negative'],
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional field
          return v > this.price; // Must be higher than actual price
        },
        message: 'Compare at price must be higher than the actual price',
      },
    },
    costPerItem: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
    },

    // Inventory
    sku: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Product quantity is required'],
      default: 0,
      min: [0, 'Quantity cannot be negative'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number',
      },
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [0, 'Threshold cannot be negative'],
    },

    // Media
    images: [
      {
        url: {
          type: String,
          required: [true, 'Image URL is required'],
        },
        alt: {
          type: String,
          default: '',
        },
        isPrimary: {
          type: Boolean,
          default: false,
        },
        order: {
          type: Number,
          default: 0,
        },
      },
    ],
    video: {
      url: String,
      thumbnail: String,
      provider: {
        type: String,
        enum: ['youtube', 'vimeo', 'self-hosted'],
      },
    },

    // Categories & Tags
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      index: true,
      validate: {
        validator: async function (value) {
          const Category = mongoose.model('Category');
          const category = await Category.findById(value);
          return category !== null;
        },
        message: 'Category does not exist',
      },
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      validate: {
        validator: async function (value) {
          if (!value) return true; // Optional field
          const SubCategory = mongoose.model('SubCategory');
          const subCategory = await SubCategory.findById(value);
          
          // Also check if subcategory belongs to the selected category
          if (subCategory && this.category) {
            return subCategory.category.toString() === this.category.toString();
          }
          return !!subCategory;
        },
        message: 'SubCategory does not exist or does not belong to the selected category',
      },
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    brand: {
      type: String,
      trim: true,
      index: true,
    },

    // Variations
    variants: [
      {
        name: {
          type: String,
          required: [true, 'Variant name is required'],
        },
        value: {
          type: String,
          required: [true, 'Variant value is required'],
        },
        sku: String,
        barcode: String,
        price: {
          type: Number,
          min: [0, 'Price cannot be negative'],
        },
        quantity: {
          type: Number,
          default: 0,
          min: [0, 'Quantity cannot be negative'],
        },
        images: [String],
      },
    ],

    // Attributes for filtering
    attributes: [
      {
        name: {
          type: String,
          required: [true, 'Attribute name is required'],
        },
        value: {
          type: String,
          required: [true, 'Attribute value is required'],
        },
        isFilterable: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // SEO
    metaTitle: {
      type: String,
      maxlength: [70, 'Meta title should not exceed 70 characters'],
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description should not exceed 160 characters'],
    },
    metaKeywords: [String],

    // Shipping
    weight: {
      value: {
        type: Number,
        min: [0, 'Weight cannot be negative'],
      },
      unit: {
        type: String,
        enum: ['kg', 'g', 'lb', 'oz'],
        default: 'kg',
      },
    },
    dimensions: {
      length: {
        type: Number,
        min: [0, 'Length cannot be negative'],
      },
      width: {
        type: Number,
        min: [0, 'Width cannot be negative'],
      },
      height: {
        type: Number,
        min: [0, 'Height cannot be negative'],
      },
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm',
      },
    },
    isPhysicalProduct: {
      type: Boolean,
      default: true,
    },
    isDigitalProduct: {
      type: Boolean,
      default: false,
    },
    digitalFileUrl: String,
    shippingClass: {
      type: String,
      enum: ['standard', 'express', 'free', 'pickup'],
    },
    freeShipping: {
      type: Boolean,
      default: false,
    },

    // Product Status & Visibility
    status: {
      type: String,
      enum: {
        values: ['draft', 'active', 'inactive', 'discontinued', 'outOfStock'],
        message: '{VALUE} is not a valid status',
      },
      default: 'draft',
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['visible', 'hidden', 'schedule'],
      default: 'visible',
    },
    publishedAt: Date,

    // Reviews & Ratings
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating must be at most 5'],
    },
    totalReviews: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalSold: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Discount
    discount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
      },
      value: {
        type: Number,
        min: [0, 'Discount value cannot be negative'],
      },
      startDate: Date,
      endDate: Date,
      isActive: {
        type: Boolean,
        default: false,
      },
    },

    // Related Products
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    frequentlyBoughtTogether: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],

    // Admin Info
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      validate: {
        validator: async function (value) {
          if (!value) return true; // Optional field
          const User = mongoose.model('User');
          const user = await User.findById(value);
          return user && user.role === 'vendor';
        },
        message: 'Vendor does not exist or is not a vendor',
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator information is required'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Custom Fields
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },

    // Additional Settings
    hasVariants: {
      type: Boolean,
      default: false,
    },
    minOrderQuantity: {
      type: Number,
      default: 1,
      min: [1, 'Minimum order quantity must be at least 1'],
    },
    maxOrderQuantity: {
      type: Number,
      validate: {
        validator: function (v) {
          if (!v) return true; // Optional
          return v >= this.minOrderQuantity;
        },
        message: 'Maximum order quantity must be greater than minimum',
      },
    },
    taxClass: {
      type: String,
      default: 'standard',
    },
    isReturnable: {
      type: Boolean,
      default: true,
    },
    returnPeriod: {
      type: Number,
      default: 30,
      min: [0, 'Return period cannot be negative'],
    },
    warranty: {
      period: {
        type: Number,
        min: [0, 'Warranty period cannot be negative'],
      },
      description: String,
    },
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
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1, status: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ 'variants.sku': 1 });
productSchema.index({ brand: 1, category: 1 });
productSchema.index({ createdAt: -1 });

// ============================================
// VIRTUALS
// ============================================
productSchema.virtual('discountPercentage').get(function () {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(
      ((this.compareAtPrice - this.price) / this.compareAtPrice) * 100
    );
  }
  return 0;
});

productSchema.virtual('currentPrice').get(function () {
  // Check for active time-based discount
  if (this.discount && this.discount.isActive) {
    const now = new Date();
    const startDate = new Date(this.discount.startDate);
    const endDate = new Date(this.discount.endDate);

    if (now >= startDate && now <= endDate) {
      if (this.discount.type === 'percentage') {
        const discountAmount = (this.price * this.discount.value) / 100;
        return Math.round((this.price - discountAmount) * 100) / 100;
      } else if (this.discount.type === 'fixed') {
        return Math.max(0, this.price - this.discount.value);
      }
    }
  }
  return this.price;
});

productSchema.virtual('stockStatus').get(function () {
  if (this.quantity <= 0) return 'Out of Stock';
  if (this.quantity <= this.lowStockThreshold) return 'Low Stock';
  return 'In Stock';
});

productSchema.virtual('isOnSale').get(function () {
  return this.compareAtPrice && this.compareAtPrice > this.price;
});

// ============================================
// PRE-SAVE HOOKS
// ============================================
productSchema.pre('save', function () {
  // Generate slug from name
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Auto-set hasVariants
  if (this.variants && this.variants.length > 0) {
    this.hasVariants = true;
  } else {
    this.hasVariants = false;
  }

  // Auto-update status based on quantity
  if (this.quantity <= 0 && this.status === 'active') {
    this.status = 'outOfStock';
  }

  // Set publishedAt when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

});

// ============================================
// ERROR HANDLING
// ============================================
productSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    next(new Error(`${field} already exists. Please use a different ${field}.`));
  } else {
    next(error);
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;