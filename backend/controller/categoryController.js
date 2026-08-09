// backend/controllers/categoryController.js
import Category from '../models/Category.js';
import mongoose from 'mongoose';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getAllCategories = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = '-createdAt',
      activeOnly = false,
      parentOnly = false 
    } = req.query;

    const query = {};
    
    // Filter only active categories if requested
    if (activeOnly === 'true') {
      query.isActive = true;
    }
    
    // Get only parent categories (no parentCategory)
    if (parentOnly === 'true') {
      query.parentCategory = null;
    }

    const categories = await Category.find(query)
      .populate('parentCategory', 'name slug')
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Category.countDocuments(query);

    res.status(200).json({
      success: true,
      data: categories,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: error.message
    });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await Category.findById(id)
      .populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category',
      error: error.message
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug: slug.toLowerCase() })
      .populate('parentCategory', 'name slug');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found with this slug'
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category by slug',
      error: error.message
    });
  }
};

// @desc    Get subcategories of a category
// @route   GET /api/categories/:id/subcategories
// @access  Public
export const getSubCategories = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    // Check if parent category exists
    const parentCategory = await Category.findById(id);
    if (!parentCategory) {
      return res.status(404).json({
        success: false,
        message: 'Parent category not found'
      });
    }

    const subcategories = await Category.find({ 
      parentCategory: id,
      isActive: true 
    }).sort('order name');

    res.status(200).json({
      success: true,
      count: subcategories.length,
      data: subcategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subcategories',
      error: error.message
    });
  }
};

// @desc    Create category (Admin)
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      image, 
      parentCategory, 
      order, 
      metaTitle, 
      metaDescription, 
      metaKeywords,
      isActive 
    } = req.body;

    // Check if category with same name exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    // Validate parent category if provided
    if (parentCategory) {
      if (!mongoose.Types.ObjectId.isValid(parentCategory)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent category ID'
        });
      }

      const parentExists = await Category.findById(parentCategory);
      if (!parentExists) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    // Format image data correctly
    let imageData = {};
    if (image) {
      // If image is a string URL
      if (typeof image === 'string') {
        imageData = { url: image };
      } else if (typeof image === 'object') {
        imageData = image;
      }
    }

    const categoryData = {
      name,
      description,
      image: imageData,
      parentCategory: parentCategory || null,
      order: order || 0,
      metaTitle: metaTitle || name,
      metaDescription: metaDescription || description?.substring(0, 160),
      metaKeywords: metaKeywords || [],
      isActive: isActive !== undefined ? isActive : true
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while creating category',
      error: error.message
    });
  }
};

// @desc    Update category (Admin)
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    let category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (req.body.name && req.body.name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${req.body.name}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Validate parent category if provided
    if (req.body.parentCategory) {
      if (!mongoose.Types.ObjectId.isValid(req.body.parentCategory)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent category ID'
        });
      }

      // Prevent circular reference
      if (req.body.parentCategory === id) {
        return res.status(400).json({
          success: false,
          message: 'Category cannot be its own parent'
        });
      }

      const parentExists = await Category.findById(req.body.parentCategory);
      if (!parentExists) {
        return res.status(404).json({
          success: false,
          message: 'Parent category not found'
        });
      }
    }

    // Update fields
    const updateFields = {};
    const allowedFields = [
      'name', 
      'description', 
      'image', 
      'parentCategory', 
      'order', 
      'isActive',
      'metaTitle',
      'metaDescription',
      'metaKeywords'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateFields[field] = req.body[field];
      }
    });

    // Update category
    category = await Category.findByIdAndUpdate(
      id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name slug');

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating category',
      error: error.message
    });
  }
};

// @desc    Delete category (Admin)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check for subcategories
    const hasSubcategories = await Category.exists({ parentCategory: id });
    
    if (hasSubcategories) {
      // Option 1: Prevent deletion if subcategories exist
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with subcategories. Delete subcategories first or reassign them.'
      });

      // Option 2: Uncomment below to allow deletion and remove parent reference from subcategories
      // await Category.updateMany(
      //   { parentCategory: id },
      //   { parentCategory: null }
      // );
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category',
      error: error.message
    });
  }
};

// @desc    Get category tree (hierarchical structure)
// @route   GET /api/categories/tree
// @access  Public
export const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .select('name slug parentCategory order')
      .sort('order name');

    // Build tree structure
    const buildTree = (parentId = null) => {
      return categories
        .filter(cat => {
          if (parentId === null) {
            return cat.parentCategory === null;
          }
          return cat.parentCategory && cat.parentCategory.toString() === parentId.toString();
        })
        .map(cat => ({
          _id: cat._id,
          name: cat.name,
          slug: cat.slug,
          order: cat.order,
          children: buildTree(cat._id)
        }));
    };

    const categoryTree = buildTree();

    res.status(200).json({
      success: true,
      data: categoryTree
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category tree',
      error: error.message
    });
  }
};