import SubCategory from '../models/SubCategory.js';
import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';

// @desc    Create new subcategory
// @route   POST /api/subcategories
// @access  Admin
const createSubCategory = asyncHandler(async (req, res) => {
  const { name, description, image, category, order } = req.body;

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if subcategory already exists in this category
  const subCategoryExists = await SubCategory.findOne({ name, category });
  if (subCategoryExists) {
    res.status(400);
    throw new Error('SubCategory already exists in this category');
  }

  const subCategory = await SubCategory.create({
    name,
    description,
    image,
    category,
    order
  });

  const populatedSubCategory = await SubCategory.findById(subCategory._id)
    .populate('category', 'name slug');

  res.status(201).json({
    success: true,
    data: populatedSubCategory
  });
});

// @desc    Get all active subcategories
// @route   GET /api/subcategories
// @access  Public
const getSubCategories = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  
  // Filter by category if provided in query
  if (req.query.category) {
    filter.category = req.query.category;
  }

  const subCategories = await SubCategory.find(filter)
    .populate('category', 'name slug')
    .sort({ order: 1 });

  res.json({
    success: true,
    count: subCategories.length,
    data: subCategories
  });
});

// @desc    Get subcategories by category ID
// @route   GET /api/subcategories/category/:categoryId
// @access  Public
const getSubCategoriesByCategory = asyncHandler(async (req, res) => {
  const subCategories = await SubCategory.find({
    category: req.params.categoryId,
    isActive: true
  })
    .populate('category', 'name slug')
    .sort({ order: 1 });

  res.json({
    success: true,
    count: subCategories.length,
    data: subCategories
  });
});

// @desc    Get single subcategory by ID
// @route   GET /api/subcategories/:id
// @access  Public
const getSubCategoryById = asyncHandler(async (req, res) => {
  const subCategory = await SubCategory.findById(req.params.id)
    .populate('category', 'name slug description');

  if (!subCategory) {
    res.status(404);
    throw new Error('SubCategory not found');
  }

  res.json({
    success: true,
    data: subCategory
  });
});

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
// @access  Admin
const updateSubCategory = asyncHandler(async (req, res) => {
  const { name, description, image, category, isActive, order } = req.body;

  const subCategory = await SubCategory.findById(req.params.id);

  if (!subCategory) {
    res.status(404);
    throw new Error('SubCategory not found');
  }

  // Check if new category exists (if category is being changed)
  if (category && category !== subCategory.category.toString()) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      res.status(404);
      throw new Error('Category not found');
    }
  }

  // Check for duplicate name in same category
  if (name) {
    const duplicate = await SubCategory.findOne({
      name,
      category: category || subCategory.category,
      _id: { $ne: req.params.id }
    });
    if (duplicate) {
      res.status(400);
      throw new Error('SubCategory name already exists in this category');
    }
  }

  const updatedSubCategory = await SubCategory.findByIdAndUpdate(
    req.params.id,
    {
      name: name || subCategory.name,
      description: description !== undefined ? description : subCategory.description,
      image: image || subCategory.image,
      category: category || subCategory.category,
      isActive: isActive !== undefined ? isActive : subCategory.isActive,
      order: order !== undefined ? order : subCategory.order
    },
    { new: true, runValidators: true }
  ).populate('category', 'name slug');

  res.json({
    success: true,
    data: updatedSubCategory
  });
});

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
// @access  Admin
const deleteSubCategory = asyncHandler(async (req, res) => {
  const subCategory = await SubCategory.findById(req.params.id);

  if (!subCategory) {
    res.status(404);
    throw new Error('SubCategory not found');
  }

  await SubCategory.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'SubCategory deleted successfully'
  });
});

// @desc    Toggle subcategory active status
// @route   PATCH /api/subcategories/:id/toggle
// @access  Admin
const toggleSubCategoryStatus = asyncHandler(async (req, res) => {
  const subCategory = await SubCategory.findById(req.params.id);

  if (!subCategory) {
    res.status(404);
    throw new Error('SubCategory not found');
  }

  subCategory.isActive = !subCategory.isActive;
  await subCategory.save();

  res.json({
    success: true,
    data: subCategory
  });
});

export {
  createSubCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  getSubCategoryById,
  updateSubCategory,
  deleteSubCategory,
  toggleSubCategoryStatus
};