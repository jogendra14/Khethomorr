// backend/models/Category.js
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  image: {
    type: String,
    default: '📦'
  },
  icon: {
    type: String,
    default: '📦'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);
export default Category;