// backend/controller/categoryController.js
import Category from "../models/categoryModel.js";
import Product from "../models/Product.js";

const normalizeName = (value) => value?.trim().replace(/\s+/g, " ");

const categoryWithProductCount = async (category) => {
  const productCount = await Product.countDocuments({ category: category.name });
  return { ...category.toObject(), productCount };
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ parentCategory: null }).sort({ name: 1 });
    const categoriesWithCounts = await Promise.all(categories.map(categoryWithProductCount));

    res.status(200).json({
      success: true,
      data: categoriesWithCounts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create a category
// @route   POST /api/admin/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { name, description = "", image = "" } = req.body;
    const normalizedName = normalizeName(name);
    
    if (!normalizedName || normalizedName.length < 2) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const existingCategory = await Category.findOne({
      name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      parentCategory: null,
    });
    if (existingCategory) {
      return res.status(409).json({ success: false, message: "A category with this name already exists" });
    }

    const category = await Category.create({ name: normalizedName, description, image });
    
    res.status(201).json({
      success: true,
      data: await categoryWithProductCount(category),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A category with this name already exists" });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, parentCategory: null });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    res.json({ success: true, data: await categoryWithProductCount(category) });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid category id" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, parentCategory: null });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const nextName = normalizeName(req.body.name);
    if (!nextName || nextName.length < 2) {
      return res.status(400).json({ success: false, message: "Category name must be at least 2 characters" });
    }

    const duplicate = await Category.findOne({
      _id: { $ne: category._id },
      name: { $regex: `^${nextName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      parentCategory: null,
    });
    if (duplicate) {
      return res.status(409).json({ success: false, message: "A category with this name already exists" });
    }

    const previousName = category.name;
    category.name = nextName;
    if (req.body.description !== undefined) category.description = req.body.description.trim();
    if (req.body.image !== undefined) category.image = req.body.image;
    await category.save();

    // Products reference categories by name, so keep those references in sync.
    if (previousName !== nextName) {
      await Product.updateMany({ category: previousName }, { $set: { category: nextName } });
    }

    res.json({ success: true, data: await categoryWithProductCount(category) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "A category with this name already exists" });
    }
    res.status(500).json({ success: false, message: error.message || "Unable to update category" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, parentCategory: null });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(409).json({
        success: false,
        message: "This category still has products. Move or delete those products first.",
      });
    }

    const childCount = await Category.countDocuments({ parentCategory: category._id });
    if (childCount > 0) {
      return res.status(409).json({
        success: false,
        message: "This category still has sub-categories. Remove them first.",
      });
    }

    await category.deleteOne();
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid category id" });
  }
};
