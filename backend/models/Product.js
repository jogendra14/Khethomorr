import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, },
    oldPrice: { type: Number, required: true, },
    newPrice: { type: Number, required: true, },
    discount: { type: Number, default: 0, },
    category: { type: String, required: true },
    subCategory: { type: String , required: true}, 
    fanSize: { type: Number },
    color: { type: String, },
    fanWattage: { type: Number },
    fanVoltage: { type: Number },
    weight: { type: Number },
    warranty_guarantee: { type: String },

    rating: { type: Number, default: 4.7 },
    numReviews: { type: Number, default: 165 },
    stock: { type: Number, required: true },
    images: [{ type: String, required: true }],
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
