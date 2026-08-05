// backend/controller/categoryController.js
import Category from "../models/categoryModel.js"; // Assuming you have this model

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private/Admin
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json({
      success: true,
      data: categories,
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
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const category = await Category.create({ name, description });
    
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add updateCategory and deleteCategory functions here if needed...