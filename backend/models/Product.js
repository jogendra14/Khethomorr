import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    subCategory: { type: String , required: true}, 
    brand: { type: String, required: true },
    name: { type: String, required: true },

    oldPrice: { type: Number, required: true, },
    newPrice: { type: Number, required: true, },
    discount: { type: Number, default: 0, },
    rating: { type: Number, default: 4.4 },
    reviews: { type: Number, default: 225 },

    choose_W_G: { type: String, },
    warranty_guarantee: { type: String },
    stock: { type: Number, required: true },
    description: { type: String, },
    images: [{ type: String, required: true }],

     // Fan Items    
    fanDesign: { type: String, },
    color: { type: String, },
    motor: {type: String},
    sweepSize: {type: String},
    bladeCount: {type: String},
    material: {type: String},
    fanWattage: { type: String },
    airDelivery: {type: String },
    fanRpm: {type: String },
    weight: { type: String },  
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
