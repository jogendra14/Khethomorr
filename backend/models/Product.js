// backend/models/Product.js

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Common fields for all products
    category: { 
      type: String, 
      required: [true, "Category is required"] 
    },
    subCategory: { 
      type: String,
      default: '' 
    },
    brand: { 
      type: String, 
      required: [true, "Brand is required"] 
    },
    name: { 
      type: String, 
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"]
    },

    MRP: { 
      type: Number, 
      required: [true, "MRP is required"],
      min: [0, "MRP cannot be negative"]
    },
    sellingPrice: { 
      type: Number, 
      required: [true, "Selling price is required"],
      min: [0, "Selling price cannot be negative"]
    },
    discount: { 
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    rating: { 
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: { 
      type: Number,
      default: 0,
      min: 0
    },

    choose_W_G: { 
      type: String,
      enum: ['', 'warranty', 'guarantee'],
      default: ''
    },
    warranty_guarantee: { 
      type: String,
      default: ''
    },
    stock: { 
      type: Number, 
      required: [true, "Stock is required"],
      min: [0, "Stock cannot be negative"]
    },
    description: { 
      type: String,
      default: '',
      maxlength: [2000, "Description cannot exceed 2000 characters"]
    },
    includeComponents: [{ 
      type: String,
      trim: true
    }],
    images: [{ 
      type: String,
      required: [true, "At least one image is required"]
    }],

    // Product type identification
    productType: { 
      type: String, 
      enum: ['fan', 'lighting', 'electricals', 'kitchenAppliances', 'bathroomAppliances', 'solar', 'smartHome', 'safety', 'others'],
      required: [true, "Product type is required"],
      default: 'fan'
    },

    // Dynamic specifications stored as Map
    specifications: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map()
    }
  },
  {
    timestamps: true,
  }
);

// ✅ Indexes for better query performance
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ name: 'text' });
productSchema.index({ brand: 1 });
productSchema.index({ sellingPrice: 1 });
productSchema.index({ createdAt: -1 });

// ✅ Compound indexes for common queries
productSchema.index({ category: 1, sellingPrice: 1 });
productSchema.index({ brand: 1, sellingPrice: 1 });

// ✅ Instance method to get formatted specifications
productSchema.methods.getSpecs = function() {
  const specs = {};
  if (this.specifications) {
    this.specifications.forEach((value, key) => {
      specs[key] = value;
    });
  }
  return specs;
};

// ✅ Static method to get product type template fields
productSchema.statics.getTemplateFields = function(productType) {
  const templates = {
    fan: ['fanDesign', 'color', 'motor', 'sweepSize', 'bladeCount', 'material', 'fanWattage', 'airDelivery', 'fanRpm', 'weight'],
    lighting: ['lightType', 'wattage', 'colorTemperature', 'lumens', 'beamAngle', 'dimmable', 'ipRating'],
    electricals: ['electricalType', 'rating', 'voltage', 'pole', 'color', 'material'],
    kitchenAppliances: ['productType', 'power', 'capacity', 'material', 'color'],
    bathroomAppliances: ['applianceType', 'power', 'capacity', 'material', 'color'],
    solar: ['solarType', 'powerRating', 'voltage', 'efficiency', 'panelType', 'batteryType'],
    smartHome: ['smartType', 'connectivity', 'compatibility', 'color', 'features'],
    safety: ['securityType', 'resolution', 'lensType', 'nightVision', 'lockType', 'ipRating'],
    others: ['productTypeName', 'material', 'color']
  };
  return templates[productType] || [];
};

// ✅ Virtual field for calculated discount
productSchema.virtual('discountPercentage').get(function() {
  if (this.MRP && this.sellingPrice && this.MRP > 0) {
    return Math.round(((this.MRP - this.sellingPrice) / this.MRP) * 100);
  }
  return 0;
});

// ✅ Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model("Product", productSchema);
export default Product;