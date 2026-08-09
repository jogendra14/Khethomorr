import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js'; // Custom async handler
import AppError from '../utils/AppError.js'; // Custom error class
import APIFeatures from '../utils/APIFeatures.js'; // API features utility

/**
 * ============================================
 * CATEGORY CONTROLLER
 * ============================================
 * Complete CRUD with advanced features:
 * - Pagination, Filtering, Sorting
 * - Slug-based operations
 * - Product counts
 * - Bulk operations
 */

// ==================== CREATE ====================

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res, next) => {
  const { name, description, image, order } = req.body;

  // Check if category exists (case-insensitive)
  const categoryExists = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
  });

  if (categoryExists) {
    throw new AppError('Category with this name already exists', 400);
  }

  // Create category
  const category = await Category.create({
    name,
    description,
    image,
    order,
  });

  // Populate subcategories (will be empty for new category)
  const populatedCategory = await Category.findById(category._id).populate({
    path: 'subcategories',
    select: 'name slug',
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: populatedCategory,
  });
});

// ==================== READ (PUBLIC) ====================

// @desc    Get all active categories (Public)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res, next) => {
  // Build query with filters
  const features = new APIFeatures(
    Category.find({ isActive: true }),
    req.query
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  // Execute query
  const categories = await features.query.populate({
    path: 'subcategories',
    match: { isActive: true },
    select: 'name slug description image order',
    options: { sort: { order: 1, name: 1 } },
  });

  // Get total count for pagination
  const total = await Category.countDocuments({ isActive: true });

  // Add product count to each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({
        category: category._id,
        status: 'active',
      });
      return {
        ...category.toObject(),
        productCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    results: categories.length,
    total,
    pagination: features.pagination,
    data: categoriesWithCount,
  });
});

// @desc    Get featured categories
// @route   GET /api/categories/featured
// @access  Public
const getFeaturedCategories = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 6;

  const categories = await Category.find({ isActive: true })
    .sort({ order: 1, createdAt: -1 })
    .limit(limit)
    .populate({
      path: 'subcategories',
      match: { isActive: true },
      select: 'name slug image',
      options: { limit: 5 },
    });

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

// ==================== READ (ADMIN) ====================

// @desc    Get all categories for admin (including inactive)
// @route   GET /api/categories/admin/all
// @access  Private/Admin
const getAllCategories = asyncHandler(async (req, res, next) => {
  // Advanced filtering for admin
  const features = new APIFeatures(Category.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const categories = await features.query.populate({
    path: 'subcategories',
    select: 'name slug isActive order',
    options: { sort: { order: 1 } },
  });

  const total = await Category.countDocuments();

  // Add stats for each category
  const categoriesWithStats = await Promise.all(
    categories.map(async (category) => {
      const [productCount, activeProductCount, subCategoryCount] =
        await Promise.all([
          Product.countDocuments({ category: category._id }),
          Product.countDocuments({
            category: category._id,
            status: 'active',
          }),
          SubCategory.countDocuments({ category: category._id }),
        ]);

      return {
        ...category.toObject(),
        stats: {
          totalProducts: productCount,
          activeProducts: activeProductCount,
          totalSubCategories: subCategoryCount,
        },
      };
    })
  );

  res.status(200).json({
    success: true,
    results: categories.length,
    total,
    pagination: features.pagination,
    data: categoriesWithStats,
  });
});

// @desc    Get category statistics
// @route   GET /api/categories/stats
// @access  Private/Admin
const getCategoryStats = asyncHandler(async (req, res, next) => {
  const stats = await Category.aggregate([
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'products',
      },
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: '_id',
        foreignField: 'category',
        as: 'subcategories',
      },
    },
    {
      $project: {
        name: 1,
        slug: 1,
        isActive: 1,
        totalProducts: { $size: '$products' },
        activeProducts: {
          $size: {
            $filter: {
              input: '$products',
              as: 'product',
              cond: { $eq: ['$$product.status', 'active'] },
            },
          },
        },
        totalSubCategories: { $size: '$subcategories' },
        averagePrice: { $avg: '$products.price' },
        totalRevenue: {
          $sum: {
            $map: {
              input: '$products',
              as: 'product',
              in: {
                $multiply: ['$$product.price', '$$product.totalSold'],
              },
            },
          },
        },
      },
    },
    { $sort: { totalProducts: -1 } },
  ]);

  res.status(200).json({
    success: true,
    count: stats.length,
    data: stats,
  });
});

// ==================== READ (SINGLE) ====================

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).populate({
    path: 'subcategories',
    match: { isActive: true },
    select: 'name slug description image order',
    options: { sort: { order: 1 } },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Get product count for this category
  const productCount = await Product.countDocuments({
    category: category._id,
    status: 'active',
  });

  res.status(200).json({
    success: true,
    data: {
      ...category.toObject(),
      productCount,
    },
  });
});

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res, next) => {
  const category = await Category.findOne({
    slug: req.params.slug,
    isActive: true,
  }).populate({
    path: 'subcategories',
    match: { isActive: true },
    select: 'name slug description image order',
    options: { sort: { order: 1 } },
  });

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Get products in this category
  const products = await Product.find({
    category: category._id,
    status: 'active',
  })
    .select('name slug price images averageRating totalSold')
    .sort({ createdAt: -1 })
    .limit(10);

  const totalProducts = await Product.countDocuments({
    category: category._id,
    status: 'active',
  });

  res.status(200).json({
    success: true,
    data: {
      ...category.toObject(),
      products: {
        items: products,
        total: totalProducts,
        showing: products.length,
      },
    },
  });
});

// ==================== UPDATE ====================

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res, next) => {
  const { name, description, image, isActive, order } = req.body;

  // Find category
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Check unique name
  if (name && name !== category.name) {
    const nameExists = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id },
    });

    if (nameExists) {
      throw new AppError('Category with this name already exists', 400);
    }
  }

  // Build update object (only update provided fields)
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (image !== undefined) updateData.image = image;
  if (isActive !== undefined) updateData.isActive = isActive;
  if (order !== undefined) updateData.order = order;

  // Update category
  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).populate({
    path: 'subcategories',
    select: 'name slug isActive',
  });

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: updatedCategory,
  });
});

// ==================== DELETE ====================

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  // Check if category has products
  const productCount = await Product.countDocuments({
    category: req.params.id,
  });

  // Optional: Force delete parameter
  if (productCount > 0 && !req.query.force) {
    throw new AppError(
      `Cannot delete category with ${productCount} products. Use force=true to delete anyway`,
      400
    );
  }

  // Delete subcategories and products if force delete
  if (req.query.force === 'true') {
    await Promise.all([
      SubCategory.deleteMany({ category: req.params.id }),
      Product.deleteMany({ category: req.params.id }),
    ]);
  } else {
    await SubCategory.deleteMany({ category: req.params.id });
  }

  // Delete category
  await Category.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
    deletedCount: {
      category: 1,
      subCategories: await SubCategory.countDocuments({
        category: req.params.id,
      }),
      products: req.query.force
        ? productCount
        : 'Products preserved (use force=true to delete)',
    },
  });
});

// @desc    Bulk delete categories
// @route   DELETE /api/categories/bulk
// @access  Private/Admin
const bulkDeleteCategories = asyncHandler(async (req, res, next) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new AppError('Please provide an array of category IDs', 400);
  }

  // Delete all associated data
  const deletePromises = ids.map(async (id) => {
    const category = await Category.findById(id);
    if (category) {
      await SubCategory.deleteMany({ category: id });
      await Product.updateMany(
        { category: id },
        { $unset: { category: '' } }
      );
      await Category.findByIdAndDelete(id);
    }
  });

  await Promise.all(deletePromises);

  res.status(200).json({
    success: true,
    message: `${ids.length} categories deleted successfully`,
  });
});

// ==================== STATUS ====================

// @desc    Toggle category active status
// @route   PATCH /api/categories/:id/toggle
// @access  Private/Admin
const toggleCategoryStatus = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  category.isActive = !category.isActive;
  await category.save();

  // Also update all subcategories if deactivating
  if (!category.isActive) {
    await SubCategory.updateMany(
      { category: category._id },
      { isActive: false }
    );
  }

  res.status(200).json({
    success: true,
    message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
    data: category,
  });
});

// @desc    Bulk toggle categories
// @route   PATCH /api/categories/bulk/toggle
// @access  Private/Admin
const bulkToggleCategories = asyncHandler(async (req, res, next) => {
  const { ids, isActive } = req.body;

  if (!ids || !Array.isArray(ids)) {
    throw new AppError('Please provide an array of category IDs', 400);
  }

  await Category.updateMany(
    { _id: { $in: ids } },
    { isActive: isActive !== undefined ? isActive : true }
  );

  res.status(200).json({
    success: true,
    message: `${ids.length} categories updated successfully`,
  });
});

// @desc    Update category order (reorder)
// @route   PATCH /api/categories/reorder
// @access  Private/Admin
const reorderCategories = asyncHandler(async (req, res, next) => {
  const { orders } = req.body; // [{id: 'id1', order: 1}, {id: 'id2', order: 2}]

  if (!orders || !Array.isArray(orders)) {
    throw new AppError('Please provide orders array', 400);
  }

  const updatePromises = orders.map(({ id, order }) =>
    Category.findByIdAndUpdate(id, { order }, { new: true })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    success: true,
    message: 'Categories reordered successfully',
  });
});

// @desc    Search categories
// @route   GET /api/categories/search
// @access  Public
const searchCategories = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q) {
    throw new AppError('Please provide a search query', 400);
  }

  const categories = await Category.find({
    isActive: true,
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } },
    ],
  })
    .select('name slug description image')
    .limit(10);

  res.status(200).json({
    success: true,
    count: categories.length,
    data: categories,
  });
});

export {
  createCategory,
  getCategories,
  getFeaturedCategories,
  getAllCategories,
  getCategoryStats,
  getCategoryById,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  toggleCategoryStatus,
  bulkToggleCategories,
  reorderCategories,
  searchCategories,
};