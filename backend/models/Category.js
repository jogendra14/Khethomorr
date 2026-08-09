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

// SINGLE pre-save middleware - Combined version
categorySchema.pre('save', async function(next) {
  try {
    console.log('Pre-save middleware called for:', this.name);
    
    // Generate slug from name if name is modified
    if (this.isModified('name') && this.name) {
      // Generate base slug
      let baseSlug = this.name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Check if slug already exists in the database
      const existingCategory = await mongoose.model('Category').findOne({
        slug: baseSlug,
        _id: { $ne: this._id }
      });
      
      if (existingCategory) {
        // Add timestamp to make it unique
        this.slug = `${baseSlug}-${Date.now()}`;
        console.log('Slug already exists, generated unique slug:', this.slug);
      } else {
        this.slug = baseSlug;
        console.log('Generated slug:', this.slug);
      }
    }
    
    // Continue with the save operation
    next();
  } catch (error) {
    console.error('Error in pre-save middleware:', error);
    next(error);
  }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;