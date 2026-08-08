import mongoose from 'mongoose';

import './Category.js';
import './SubCategory.js';

const productSchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
      index: true // For faster search
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters']
    },

    // Pricing
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    compareAtPrice: {
      type: Number,
      min: [0, 'Compare at price cannot be negative']
    },
    costPerItem: {
      type: Number,
      min: [0, 'Cost cannot be negative']
    },

    // Inventory
    sku: {
      type: String,
      unique: true,
      sparse: true // Allows null values
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Quantity cannot be negative']
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },

    // Media
    images: [{
      url: {
        type: String,
        required: true
      },
      alt: String,
      isPrimary: {
        type: Boolean,
        default: false
      },
      order: Number
    }],
    video: {
      url: String,
      thumbnail: String,
      provider: {
        type: String,
        enum: ['youtube', 'vimeo', 'self-hosted']
      }
    },

    // Categories & Tags
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      index: true
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory'
    },
    tags: [{
      type: String,
      lowercase: true,
      trim: true
    }],
    brand: {
      type: String,
      trim: true,
      index: true
    },

    // Variations (for different sizes, colors etc.)
    variants: [{
      name: String, // e.g., "Color", "Size"
      value: String, // e.g., "Red", "XL"
      sku: String,
      barcode: String,
      price: Number,
      quantity: Number,
      images: [String]
    }],
    
    // Attributes for filtering
    attributes: [{
      name: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      },
      isFilterable: {
        type: Boolean,
        default: false
      }
    }],

    // SEO
    metaTitle: {
      type: String,
      maxlength: [70, 'Meta title should not exceed 70 characters']
    },
    metaDescription: {
      type: String,
      maxlength: [160, 'Meta description should not exceed 160 characters']
    },
    metaKeywords: [String],
    
    // Shipping
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'g', 'lb', 'oz'],
        default: 'kg'
      }
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'in'],
        default: 'cm'
      }
    },
    isPhysicalProduct: {
      type: Boolean,
      default: true
    },
    isDigitalProduct: {
      type: Boolean,
      default: false
    },
    digitalFileUrl: String, // For digital products
    shippingClass: {
      type: String,
      enum: ['standard', 'express', 'free', 'pickup']
    },
    freeShipping: {
      type: Boolean,
      default: false
    },

    // Product Status & Visibility
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive', 'discontinued', 'outOfStock'],
      default: 'draft',
      index: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    visibility: {
      type: String,
      enum: ['visible', 'hidden', 'schedule'],
      default: 'visible'
    },
    publishedAt: Date,
    
    // Reviews & Ratings (Summary)
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating must be at most 5']
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalSold: {
      type: Number,
      default: 0
    },

    // Discount
    discount: {
      type: {
        type: String,
        enum: ['percentage', 'fixed']
      },
      value: Number,
      startDate: Date,
      endDate: Date,
      isActive: {
        type: Boolean,
        default: false
      }
    },

    // Related Products
    relatedProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    frequentlyBoughtTogether: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],

    // Admin Info
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Custom Fields (For future extensibility)
    customFields: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    },

    // Additional Settings
    hasVariants: {
      type: Boolean,
      default: false
    },
    minOrderQuantity: {
      type: Number,
      default: 1
    },
    maxOrderQuantity: {
      type: Number
    },
    taxClass: {
      type: String,
      default: 'standard'
    },
    isReturnable: {
      type: Boolean,
      default: true
    },
    returnPeriod: {
      type: Number, // in days
      default: 30
    },
    warranty: {
      period: Number, // in months
      description: String
    }
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ 'variants.sku': 1 });
productSchema.index({ brand: 1, category: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.compareAtPrice && this.compareAtPrice > this.price) {
    return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
  }
  return 0;
});

// Virtual for current price (considering active discount)
productSchema.virtual('currentPrice').get(function() {
  if (this.discount && this.discount.isActive) {
    const now = new Date();
    if (now >= this.discount.startDate && now <= this.discount.endDate) {
      if (this.discount.type === 'percentage') {
        return this.price - (this.price * this.discount.value / 100);
      } else if (this.discount.type === 'fixed') {
        return this.price - this.discount.value;
      }
    }
  }
  return this.price;
});

// Pre-save hook to generate slug
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;