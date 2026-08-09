// backend/models/Category.js
import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: String,
    alt: String
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String]
}, {
  timestamps: true
});

// Generate slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Optional: Add a unique slug validator
categorySchema.pre('save', async function(next) {
  if (this.isModified('slug')) {
    const slugRegex = new RegExp(`^${this.slug}(-[0-9]+)?$`, 'i');
    const existingCategory = await mongoose.model('Category').findOne({
      slug: slugRegex,
      _id: { $ne: this._id }
    });
    if (existingCategory) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }
  next();
});
const Category = mongoose.model('Category', categorySchema);

export default Category;