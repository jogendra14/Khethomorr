import SubCategory from '../models/SubCategory.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';

/**
 * ============================================
 * SUB-CATEGORY CONTROLLER
 * ============================================
 * Complete CRUD with advanced features:
 * - Category-based filtering
 * - Product associations
 * - Slug operations
 * - Bulk management
 */

// ==================== CREATE ====================

// @desc    Create new subcategory
// @route   POST /api/subcategories
// @access  Private/Admin
const createSubCategory = asyncHandler(async (req, res, next) => {
  const { name, description, image, category, order } = req.body;

  // Validate category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    throw new AppError('Parent category not found', 404);
  }

  // Check if category is active
  if (!categoryExists.isActive) {
    throw new AppError(
      'Cannot add subcategory to an inactive category',
      400
    );
  }

  // Check duplicate (case-insensitive)
  const duplicateExists = await SubCategory.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    category,
  });

  if (duplicateExists) {
    throw new AppError(
      'SubCategory with this name already exists in this category',
      400
    );
  }

  // Create subcategory
  const subCategory = await SubCategory.create({
    name,
    description,
    image,
    category,
    order,
  });

  // Populate parent category
  const populatedSubCategory = await SubCategory.findById(
    subCategory._id
  ).populate('category', 'name slug image');

  res.status(201).json({
    success: true,
    message: 'SubCategory created successfully',
    data: populatedSubCategory,
  });
});

// ==================== READ (PUBLIC) ====================

// @desc    Get all active subcategories
// @route   GET /api/subcategories
// @access  Public
const getSubCategories = asyncHandler(async (req, res, next) => {
  // Build filter
  const filter = { isActive: true };

  // Filter by category if provided
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Filter by multiple categories
  if (req.query.categories) {
    const categoryIds = req.query.categories.split(',');
    filter.category = { $in: categoryIds };
  }

  // Apply API features
  const features = new APIFeatures(SubCategory.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const subCategories = await features.query.populate(
    'category',
    'name slug image'
  );

  const total = await SubCategory.countDocuments(filter);

  // Add product counts
  const subCategoriesWithCount = await Promise.all(
    subCategories.map(async (subCategory) => {
      const productCount = await Product.countDocuments({
        subCategory: subCategory._id,
        status: 'active',
      });
      return {
        ...subCategory.toObject(),
        productCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    results: subCategories.length,
    total,
    pagination: features.pagination,
    data: subCategoriesWithCount,
  });
});

// @desc    Get subcategories by category
// @route   GET /api/subcategories/category/:categoryId
// @access  Public
const getSubCategoriesByCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;

  // Verify category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const subCategories = await SubCategory.find({
    category: categoryId,
    isActive: true,
  })
    .populate('category', 'name slug')
    .sort({ order: 1, name: 1 });

  // Group subcategories by their first letter (optional)
  const grouped =
    req.query.group === 'true'
      ? subCategories.reduce((acc, sub) => {
          const firstLetter = sub.name[0].toUpperCase();
          if (!acc[firstLetter]) acc[firstLetter] = [];
          acc[firstLetter].push(sub);
          return acc;
        }, {})
      : null;

  res.status(200).json({
    success: true,
    count: subCategories.length,
    category: {
      _id: category._id,
      name: category.name,
      slug: category.slug,
    },
    data: grouped || subCategories,
  });
});

// @desc    Get subcategories with products
// @route   GET /api/subcategories/with-products
// @access  Public
const getSubCategoriesWithProducts = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;

  const subCategories = await SubCategory.find({ isActive: true })
    .populate('category', 'name slug')
    .limit(limit);

  const subCategoriesWithProducts = await Promise.all(
    subCategories.map(async (subCategory) => {
      const products = await Product.find({
        subCategory: subCategory._id,
        status: 'active',
      })
        .select('name slug price images averageRating')
        .limit(4)
        .sort({ createdAt: -1 });

      return {
        ...subCategory.toObject(),
        products,
        productCount: products.length,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: subCategoriesWithProducts.length,
    data: subCategoriesWithProducts,
  });
});

// ==================== READ (ADMIN) ====================

// @desc    Get all subcategories (admin)
// @route   GET /api/subcategories/admin/all
// @access  Private/Admin
const getAllSubCategories = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(SubCategory.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const subCategories = await features.query
    .populate('category', 'name slug isActive')
    .lean();

  const total = await SubCategory.countDocuments();

  // Add stats
  const subCategoriesWithStats = await Promise.all(
    subCategories.map(async (sub) => {
      const [productCount, activeProductCount] = await Promise.all([
        Product.countDocuments({ subCategory: sub._id }),
        Product.countDocuments({
          subCategory: sub._id,
          status: 'active',
        }),
      ]);

      return {
        ...sub,
        stats: {
          totalProducts: productCount,
          activeProducts: activeProductCount,
        },
      };
    })
  );

  res.status(200).json({
    success: true,
    results: subCategories.length,
    total,
    pagination: features.pagination,
    data: subCategoriesWithStats,
  });
});

// ==================== READ (SINGLE) ====================

// @desc    Get single subcategory
// @route   GET /api/subcategories/:id
// @access  Public
const getSubCategoryById = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id)
    .populate('category', 'name slug description image')
    .lean();

  if (!subCategory) {
    throw new AppError('SubCategory not found', 404);
  }

  // Get associated products
  const products = await Product.find({
    subCategory: subCategory._id,
    status: 'active',
  })
    .select('name slug price images averageRating')
    .sort({ createdAt: -1 })
    .limit(8);

  const totalProducts = await Product.countDocuments({
    subCategory: subCategory._id,
    status: 'active',
  });

  res.status(200).json({
    success: true,
    data: {
      ...subCategory,
      products: {
        items: products,
        total: totalProducts,
        showing: products.length,
      },
    },
  });
});

// @desc    Get subcategory by slug
// @route   GET /api/subcategories/slug/:slug
// @access  Public
const getSubCategoryBySlug = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findOne({
    slug: req.params.slug,
    isActive: true,
  })
    .populate('category', 'name slug')
    .lean();

  if (!subCategory) {
    throw new AppError('SubCategory not found', 404);
  }

  res.status(200).json({
    success: true,
    data: subCategory,
  });
});

// ==================== UPDATE ====================

// @desc    Update subcategory
// @route   PUT /api/subcategories/:id
// @access  Private/Admin
const updateSubCategory = asyncHandler(async (req, res, next) => {
  const { name, description, image, category, isActive, order } = req.body;

  // Find subcategory
  const subCategory = await SubCategory.findById(req.params.id);

  if (!subCategory) {
    throw new AppError('SubCategory not found', 404);
  }

  // Validate new category if provided
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new AppError('New parent category not found', 404);
    }
    if (!categoryExists.isActive) {
      throw new AppError(
        'Cannot move subcategory to an inactive category',
        400
      );
    }
  }

  // Check duplicate name
  if (name && name !== subCategory.name) {
    const duplicate = await SubCategory.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      category: category || subCategory.category,
      _id: { $ne: req.params.id },
    });

    if (duplicate) {
      throw new AppError(
        'SubCategory with this name already exists in this category',
        400
      );
    }
  }

  // Build update object
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;
  if (category !== undefined) updateData.category = category;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (order !== undefined) updateData.order = order;

  // Update
  const updatedSubCategory = await SubCategory.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).populate('category', 'name slug image');

  res.status(200).json({
    success: true,
    message: 'SubCategory updated successfully',
    data: updatedSubCategory,
  });
});

// ==================== DELETE ====================

// @desc    Delete subcategory
// @route   DELETE /api/subcategories/:id
// @access  Private/Admin
const deleteSubCategory = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id);

  if (!subCategory) {
    throw new AppError('SubCategory not found', 404);
  }

  // Check for associated products
  const productCount = await Product.countDocuments({
    subCategory: req.params.id,
  });

  if (productCount > 0 && req.query.force !== 'true') {
    throw new AppError(
      `Cannot delete subcategory with ${productCount} products. Use force=true to delete anyway`,
      400
    );
  }

  // Remove subcategory from products
  if (req.query.force === 'true') {
    await Product.updateMany(
      { subCategory: req.params.id },
      { $unset: { subCategory: '' } }
    );
  }

  await SubCategory.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'SubCategory deleted successfully',
  });
});

// @desc    Bulk delete subcategories
// @route   DELETE /api/subcategories/bulk
// @access  Private/Admin
const bulkDeleteSubCategories = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Please provide an array of subcategory IDs', 400);
  }

  await Product.updateMany(
    { subCategory: { $in: ids } },
    { $unset: { subCategory: '' } }
  );

  const result = await SubCategory.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} subcategories deleted successfully`,
  });
});

// ==================== STATUS ====================

// @desc    Toggle subcategory active status
// @route   PATCH /api/subcategories/:id/toggle
// @access  Private/Admin
const toggleSubCategoryStatus = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id);

  if (!subCategory) {
    throw new AppError('SubCategory not found', 404);
  }

  // Check parent category status
  if (!subCategory.isActive) {
    // Activating subcategory
    const parentCategory = await Category.findById(subCategory.category);
    if (parentCategory && !parentCategory.isActive) {
      throw new AppError(
        'Cannot activate subcategory when parent category is inactive',
        400
      );
    }
  }

  subCategory.isActive = !subCategory.isActive;
  await subCategory.save();

  res.status(200).json({
    success: true,
    message: `SubCategory ${
      subCategory.isActive ? 'activated' : 'deactivated'
    } successfully`,
    data: subCategory,
  });
});

// @desc    Bulk toggle subcategories
// @route   PATCH /api/subcategories/bulk/toggle
// @access  Private/Admin
const bulkToggleSubCategories = asyncHandler(async (req, res, next) => {
  const { ids, isActive } = req.body;

  if (!ids || !Array.isArray(ids)) {
    throw new AppError('Please provide an array of subcategory IDs', 400);
  }

  await SubCategory.updateMany(
    { _id: { $in: ids } },
    { isActive: isActive !== undefined ? isActive : true }
  );

  res.status(200).json({
    success: true,
    message: `${ids.length} subcategories updated successfully`,
  });
});

// @desc    Move subcategories to different category
// @route   PATCH /api/subcategories/move
// @access  Private/Admin
const moveSubCategories = asyncHandler(async (req, res, next) => {
  const { subCategoryIds, newCategoryId } = req.body;

  if (!subCategoryIds || !newCategoryId) {
    throw new AppError(
      'Please provide subCategoryIds and newCategoryId',
      400
    );
  }

  // Validate new category
  const category = await Category.findById(newCategoryId);
  if (!category) {
    throw new AppError('Target category not found', 404);
  }

  // Move subcategories
  const result = await SubCategory.updateMany(
    { _id: { $in: subCategoryIds } },
    { category: newCategoryId }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} subcategories moved successfully`,
  });
});

export {
  createSubCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  getSubCategoriesWithProducts,
  getAllSubCategories,
  getSubCategoryById,
  getSubCategoryBySlug,
  updateSubCategory,
  deleteSubCategory,
  bulkDeleteSubCategories,
  toggleSubCategoryStatus,
  bulkToggleSubCategories,
  moveSubCategories,
};