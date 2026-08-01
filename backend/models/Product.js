import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, },
    oldPrice: { type: Number, required: true, },
    newPrice: { type: Number, required: true, },
    discount: { type: Number, default: 0, },
    category: { type: String, required: true },
    subCategory: { type: String , required: true}, 

    color: { type: String, },
    fanSize: { type: String },

    stock: { type: Number, required: true },
    images: [{ type: String, required: true }],
    rating: { type: Number, default: 25 },
    numReviews: { type: Number, default: 0 },
    brand: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model("Product", productSchema);

export default Product;
