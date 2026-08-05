// backend/models/categoryModel.js
import mongoose from "mongoose";

const categorySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    image: {
      type: String,
      default: "", // Cloudinary URL ya local path yahan aayega
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null, // Agar null hai to ye main category hai, agar kisi ID se link hai to sub-category
    },
    isActive: {
      type: Boolean,
      default: true, // Admin category ko hide/show kar sakta hai
    },
  },
  {
    timestamps: true, // createdAt aur updatedAt automatically add ho jayenge
  }
);

// ✅ Slug automatically generate karne ka pre-save hook (Optional)
// Agar aap slug manually nahi bhej rahe ho to ye naam se slug bana dega
categorySchema.pre("save", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, "-");
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;