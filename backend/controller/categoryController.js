import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';
import asyncHandler from 'express-async-handler';

// @desc    Create new category
// @route   POST /api/categories
// @access  Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, order } = req.body;

  const categoryExists = await Category.findOne({ name });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name,
    description,
    image,
    order
  });

  res.status(201).json({
    success: true,
    data: category
  });
});

// @desc    Get all categories with subcategories (Public)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate({
      path: 'subcategories',
      match: { isActive: true },
      select: 'name slug description image order',
      options: { sort: { order: 1 } }
    })
    .sort({ order: 1 });

  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get all categories for admin (including inactive)
// @route   GET /api/categories/admin/all
// @access  Admin
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .populate({
      path: 'subcategories',
      select: 'name slug description image isActive order',
      options: { sort: { order: 1 } }
    })
    .sort({ order: 1 });

  res.json({
    success: true,
    count: categories.length,
    data: categories
  });
});

// @desc    Get single category with subcategories
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate({
      path: 'subcategories',
      match: { isActive: true },
      select: 'name slug description image order'
    });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({
    success: true,
    data: category
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug })
    .populate({
      path: 'subcategories',
      match: { isActive: true },
      select: 'name slug description image order'
    });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  res.json({
    success: true,
    data: category
  });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Admin
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image, isActive, order } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if new name conflicts with existing
  if (name && name !== category.name) {
    const nameExists = await Category.findOne({ 
      name, 
      _id: { $ne: req.params.id } 
    });
    if (nameExists) {
      res.status(400);
      throw new Error('Category name already exists');
    }
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      image: image || category.image,
      isActive: isActive !== undefined ? isActive : category.isActive,
      order: order !== undefined ? order : category.order
    },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    data: updatedCategory
  });
});

// @desc    Delete category and its subcategories
// @route   DELETE /api/categories/:id
// @access  Admin
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Delete all subcategories associated with this category
  await SubCategory.deleteMany({ category: req.params.id });
  await Category.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Category and associated subcategories deleted successfully'
  });
});

// @desc    Toggle category active status
// @route   PATCH /api/categories/:id/toggle
// @access  Admin
const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  category.isActive = !category.isActive;
  await category.save();

  res.json({
    success: true,
    data: category
  });
});

export {
  createCategory,
  getCategories,
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus
};