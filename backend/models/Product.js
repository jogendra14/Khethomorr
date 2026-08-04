// backend/models/Product.js

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    // Common fields for all products
    category: { type: String, required: true },
    subCategory: { type: String },
    brand: { type: String, required: true },
    name: { type: String, required: true },

    MRP: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    discount: { type: Number, },
    rating: { type: Number, },
    reviews: { type: Number, },

    choose_W_G: { type: String },
    warranty_guarantee: { type: String },
    stock: { type: Number, required: true },
    description: { type: String },
    includeComponents: [{ type: String }],
    images: [{ type: String, required: true }],

    // Product type identification
    productType: { 
      type: String, 
      enum: ['fan', 'lighting', 'electricals', 'appliances', 'solar', 'smartHome', 'safety', 'others'],
      required: true,
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

// Indexes for better query performance
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ name: 'text' });
productSchema.index({ brand: 1 });
productSchema.index({ sellingPrice: 1 });

// Instance method to get formatted specifications
productSchema.methods.getSpecs = function() {
  const specs = {};
  if (this.specifications) {
    this.specifications.forEach((value, key) => {
      specs[key] = value;
    });
  }
  return specs;
};

// Static method to get product type template fields
productSchema.statics.getTemplateFields = function(productType) {
  const templates = {
    fan: ['fanDesign', 'color', 'motor', 'sweepSize', 'bladeCount', 'material', 'fanWattage', 'airDelivery', 'fanRpm', 'weight'],
    lighting: ['lightType', 'wattage', 'colorTemperature', 'lumens', 'beamAngle', 'dimmable', 'ipRating'],
    electricals: ['electricalType', 'rating', 'voltage', 'pole', 'color', 'material'],
    appliances: ['applianceType', 'power', 'capacity', 'material', 'color'],
    solar: ['solarType', 'powerRating', 'voltage', 'efficiency', 'panelType', 'batteryType'],
    smartHome: ['smartType', 'connectivity', 'compatibility', 'color', 'features'],
    safety: ['securityType', 'resolution', 'lensType', 'nightVision', 'lockType', 'ipRating'],
    others: ['productTypeName', 'material', 'color']
  };
  return templates[productType] || [];
};

const Product = mongoose.model("Product", productSchema);
export default Product;