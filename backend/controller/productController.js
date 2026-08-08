// controller/productController.js

import Product from "../models/Product.js"
import Category from '../models/Category.js';  // Import Category
import SubCategory from '../models/SubCategory.js';  // Import SubCategory
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// ============================================
// CREATE PRODUCT
// ============================================
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      shortDescription,
      price,
      compareAtPrice,
      costPerItem,
      sku,
      barcode,
      quantity,
      lowStockThreshold,
      category,
      subCategory,
      tags,
      brand,
      variants,
      attributes,
      metaTitle,
      metaDescription,
      metaKeywords,
      weight,
      dimensions,
      isPhysicalProduct,
      isDigitalProduct,
      digitalFileUrl,
      shippingClass,
      freeShipping,
      status,
      isFeatured,
      visibility,
      discount,
      relatedProducts,
      frequentlyBoughtTogether,
      vendor,
      minOrderQuantity,
      maxOrderQuantity,
      taxClass,
      isReturnable,
      returnPeriod,
      warranty,
      customFields
    } = req.body;

    // Check for existing SKU
    if (sku) {
      const existingProduct = await Product.findOne({ sku });
      if (existingProduct) {
        return res.status(400).json({
          success: false,
          message: 'Product with this SKU already exists'
        });
      }
    }

    // Image handling (if files uploaded)
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: `${name} - Image ${index + 1}`,
        isPrimary: index === 0,
        order: index + 1
      }));
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      shortDescription,
      price,
      compareAtPrice,
      costPerItem,
      sku,
      barcode,
      quantity,
      lowStockThreshold,
      images,
      category,
      subCategory,
      tags: tags || [],
      brand,
      variants: variants || [],
      attributes: attributes || [],
      metaTitle: metaTitle || name,
      metaDescription: metaDescription || shortDescription,
      metaKeywords: metaKeywords || [],
      weight,
      dimensions,
      isPhysicalProduct,
      isDigitalProduct,
      digitalFileUrl,
      shippingClass: shippingClass || 'standard',
      freeShipping: freeShipping || false,
      status: status || 'draft',
      isFeatured: isFeatured || false,
      visibility: visibility || 'visible',
      discount,
      relatedProducts,
      frequentlyBoughtTogether,
      vendor,
      createdBy: req.user._id, // Assuming authentication middleware
      minOrderQuantity: minOrderQuantity || 1,
      maxOrderQuantity,
      taxClass: taxClass || 'standard',
      isReturnable: isReturnable !== undefined ? isReturnable : true,
      returnPeriod: returnPeriod || 30,
      warranty,
      customFields: customFields || {}
    });

    // Populate references
    await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'subCategory', select: 'name slug' },
      { path: 'vendor', select: 'name email' },
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    // Delete uploaded images if product creation fails
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = path.join('uploads/products', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    res.status(400).json({
      success: false,
      message: 'Failed to create product',
      error: error.message
    });
  }
};

// ============================================
// GET ALL PRODUCTS (With Filtering, Pagination, Search)
// ============================================
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      category,
      subCategory,
      brand,
      minPrice,
      maxPrice,
      status,
      isFeatured,
      tags,
      inStock,
      discount,
      minRating,
      vendor,
      createdBy,
      startDate,
      endDate
    } = req.query;

    // Build filter object
    const filter = {};

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Category filter
    if (category) {
      filter.category = mongoose.Types.ObjectId.isValid(category) 
        ? category 
        : null;
    }

    // SubCategory filter
    if (subCategory) {
      filter.subCategory = mongoose.Types.ObjectId.isValid(subCategory) 
        ? subCategory 
        : null;
    }

    // Brand filter
    if (brand) {
      filter.brand = brand;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Featured products
    if (isFeatured) {
      filter.isFeatured = isFeatured === 'true';
    }

    // In stock filter
    if (inStock === 'true') {
      filter.quantity = { $gt: 0 };
    }

    // Active discount filter
    if (discount === 'true') {
      filter['discount.isActive'] = true;
      filter['discount.startDate'] = { $lte: new Date() };
      filter['discount.endDate'] = { $gte: new Date() };
    }

    // Rating filter
    if (minRating) {
      filter.averageRating = { $gte: Number(minRating) };
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      filter.tags = { $in: tagArray };
    }

    // Vendor filter
    if (vendor) {
      filter.vendor = vendor;
    }

    // Created by filter
    if (createdBy) {
      filter.createdBy = createdBy;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort handling
    let sortOption = {};
    if (sort.startsWith('-')) {
      sortOption[sort.substring(1)] = -1;
    } else {
      sortOption[sort] = 1;
    }

    // Execute query with pagination
    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate({
          path: 'category',
          select: 'name slug',
          // Agar category nahi milti to error mat do
          options: { strictPopulate: false }
        })
        .populate({
          path: 'subCategory',
          select: 'name slug',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'vendor',
          select: 'name email',
          options: { strictPopulate: false }
        })
        .populate({
          path: 'createdBy',
          select: 'name email',
          options: { strictPopulate: false }
        })
        .populate('relatedProducts', 'name price images slug')
        .select('-__v')
        .lean(),
      Product.countDocuments(filter)
    ]);

    // Get min and max prices for filter options
    const priceStats = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
      priceRange: priceStats[0] ? {
        min: priceStats[0].minPrice,
        max: priceStats[0].maxPrice
      } : null,
      data: products
    });

  } catch (error) {
    console.error('Error in getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
};

// ============================================
// GET SINGLE PRODUCT
// ============================================
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id)
      .populate('category', 'name slug description')
      .populate('subCategory', 'name slug')
      .populate('vendor', 'name email phone')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('relatedProducts', 'name price images slug')
      .populate('frequentlyBoughtTogether', 'name price images slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count (if you have such field)
    // product.views += 1;
    // await product.save();

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// ============================================
// GET PRODUCT BY SLUG
// ============================================
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug })
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('vendor', 'name email')
      .populate('relatedProducts', 'name price images slug')
      .populate('frequentlyBoughtTogether', 'name price images slug');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
};

// ============================================
// UPDATE PRODUCT
// ============================================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Handle image updates
    let updatedImages = product.images;
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => ({
        url: `/uploads/products/${file.filename}`,
        alt: `${req.body.name || product.name} - Image ${index + 1}`,
        isPrimary: index === 0 && product.images.length === 0,
        order: product.images.length + index + 1
      }));
      updatedImages = [...product.images, ...newImages];
    }

    // Handle image deletion
    if (req.body.removeImages) {
      const imagesToRemove = JSON.parse(req.body.removeImages);
      
      // Delete files from server
      imagesToRemove.forEach(imageUrl => {
        const filePath = path.join(process.cwd(), imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });

      updatedImages = updatedImages.filter(
        img => !imagesToRemove.includes(img.url)
      );
    }

    // Prepare update data
    const updateData = {
      ...req.body,
      images: updatedImages,
      updatedBy: req.user._id
    };

    // Don't allow updating certain fields directly
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.createdBy;
    delete updateData.totalSold;
    delete updateData.averageRating;
    delete updateData.totalReviews;

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    )
      .populate('category', 'name slug')
      .populate('subCategory', 'name slug')
      .populate('vendor', 'name email')
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update product',
      error: error.message
    });
  }
};

// ============================================
// DELETE PRODUCT (Soft Delete)
// ============================================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete - just change status
    product.status = 'inactive';
    product.updatedBy = req.user._id;
    await product.save();

    // For hard delete, uncomment below:
    // Delete associated images
    // product.images.forEach(image => {
    //   const filePath = path.join(process.cwd(), image.url);
    //   if (fs.existsSync(filePath)) {
    //     fs.unlinkSync(filePath);
    //   }
    // });
    // await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: {}
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: error.message
    });
  }
};

// ============================================
// BULK DELETE PRODUCTS
// ============================================
export const bulkDeleteProducts = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of product IDs'
      });
    }

    // Soft delete - change status to inactive
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { 
        $set: { 
          status: 'inactive',
          updatedBy: req.user._id,
          updatedAt: new Date()
        } 
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} products deleted successfully`
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete products',
      error: error.message
    });
  }
};

// ============================================
// UPDATE PRODUCT STATUS
// ============================================
export const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['draft', 'active', 'inactive', 'discontinued', 'outOfStock'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { 
        status,
        updatedBy: req.user._id,
        ...(status === 'active' && { publishedAt: new Date() })
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Product status updated to ${status}`,
      data: product
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update product status',
      error: error.message
    });
  }
};

// ============================================
// UPDATE PRODUCT STOCK
// ============================================
export const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, operation } = req.body;
    // operation: 'set', 'add', 'subtract'

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let newQuantity;
    switch (operation) {
      case 'add':
        newQuantity = product.quantity + quantity;
        break;
      case 'subtract':
        newQuantity = product.quantity - quantity;
        if (newQuantity < 0) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient stock'
          });
        }
        break;
      case 'set':
      default:
        newQuantity = quantity;
        break;
    }

    product.quantity = newQuantity;
    
    // Auto update status based on stock
    if (newQuantity === 0) {
      product.status = 'outOfStock';
    } else if (newQuantity <= product.lowStockThreshold) {
      // Keep current status but log low stock
      console.log(`Low stock alert: Product ${product.name} has only ${newQuantity} items left`);
    }

    product.updatedBy = req.user._id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        productId: product._id,
        name: product.name,
        previousQuantity: req.body.previousQuantity || product.quantity,
        newQuantity: product.quantity,
        status: product.status
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update stock',
      error: error.message
    });
  }
};

// ============================================
// GET FEATURED PRODUCTS
// ============================================
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.find({
      isFeatured: true,
      status: 'active',
      quantity: { $gt: 0 }
    })
      .sort('-createdAt')
      .limit(parseInt(limit))
      .populate('category', 'name slug')
      .select('name price compareAtPrice images averageRating totalReviews slug');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
};

// ============================================
// GET PRODUCTS BY CATEGORY
// ============================================
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20, sort = '-createdAt', minPrice, maxPrice, brand } = req.query;

    const filter = {
      category: categoryId,
      status: 'active',
      quantity: { $gt: 0 }
    };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (brand) {
      filter.brand = brand;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, totalProducts, brands] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .select('name price compareAtPrice images averageRating totalReviews slug brand')
        .lean(),
      Product.countDocuments(filter),
      Product.distinct('brand', { category: categoryId, status: 'active' })
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
      availableBrands: brands.filter(Boolean),
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products by category',
      error: error.message
    });
  }
};

// ============================================
// SEARCH PRODUCTS (Advanced)
// ============================================
export const searchProducts = async (req, res) => {
  try {
    const {
      q,
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      sort = 'relevance'
    } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const filter = {
      status: 'active',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { sku: { $regex: q, $options: 'i' } }
      ]
    };

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let sortOption = {};
    if (sort === 'price_asc') sortOption = { price: 1 };
    else if (sort === 'price_desc') sortOption = { price: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };
    else if (sort === 'rating') sortOption = { averageRating: -1 };
    else sortOption = { score: { $meta: 'textScore' } }; // relevance

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .populate('category', 'name slug')
        .select('name price compareAtPrice images averageRating totalReviews slug brand')
        .lean(),
      Product.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      query: q,
      count: products.length,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limitNum),
      currentPage: pageNum,
      data: products
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Search failed',
      error: error.message
    });
  }
};

// ============================================
// GET PRODUCT STATISTICS
// ============================================
export const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          activeProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          outOfStockProducts: {
            $sum: { $cond: [{ $eq: ['$status', 'outOfStock'] }, 1, 0] }
          },
          totalValue: { 
            $sum: { $multiply: ['$price', '$quantity'] } 
          },
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          totalSold: { $sum: '$totalSold' }
        }
      }
    ]);

    const categoryStats = await Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          productCount: { $sum: 1 },
          averagePrice: { $avg: '$price' },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $project: {
          categoryName: '$categoryInfo.name',
          productCount: 1,
          averagePrice: 1,
          totalValue: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {},
        categoryWise: categoryStats
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product statistics',
      error: error.message
    });
  }
};

// ============================================
// BULK UPDATE PRODUCTS
// ============================================
export const bulkUpdateProducts = async (req, res) => {
  try {
    const { productIds, updates } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of product IDs'
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide updates'
      });
    }

    // Don't allow updating certain fields in bulk
    const allowedUpdates = ['status', 'isFeatured', 'category', 'brand', 'freeShipping', 'taxClass'];
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    filteredUpdates.updatedBy = req.user._id;
    filteredUpdates.updatedAt = new Date();

    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: filteredUpdates }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} products updated successfully`,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update products',
      error: error.message
    });
  }
};

// ============================================
// ADD PRODUCT VARIANT
// ============================================
export const addProductVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if variant SKU already exists
    if (variant.sku) {
      const existingVariant = product.variants.find(v => v.sku === variant.sku);
      if (existingVariant) {
        return res.status(400).json({
          success: false,
          message: 'Variant with this SKU already exists'
        });
      }
    }

    product.variants.push(variant);
    product.hasVariants = true;
    product.updatedBy = req.user._id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Variant added successfully',
      data: product.variants[product.variants.length - 1]
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add variant',
      error: error.message
    });
  }
};

// ============================================
// REMOVE PRODUCT VARIANT
// ============================================
export const removeProductVariant = async (req, res) => {
  try {
    const { id, variantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const variantIndex = product.variants.findIndex(
      v => v._id.toString() === variantId
    );

    if (variantIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Variant not found'
      });
    }

    product.variants.splice(variantIndex, 1);
    if (product.variants.length === 0) {
      product.hasVariants = false;
    }
    product.updatedBy = req.user._id;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Variant removed successfully'
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to remove variant',
      error: error.message
    });
  }
};

// Export all functions
export default {
  createProduct,
  getAllProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  updateProductStatus,
  updateProductStock,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  getProductStats,
  bulkUpdateProducts,
  addProductVariant,
  removeProductVariant
};