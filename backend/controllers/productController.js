import mongoose from "mongoose"; // ← ADD THIS
import path from "path"; // ← ADD THIS
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";
import APIFeatures from "../utils/APIFeatures.js";
import { deleteFile, deleteFiles } from "../utils/fileManager.js";

// ... baaki sab same hai
/**
 * ============================================
 * PRODUCT CONTROLLER - Complete Product Management
 * ============================================
 * Features: CRUD, Search, Filter, Stock Management,
 * Variants, Bulk Operations, Image Handling
 */

// ==================== CREATE ====================

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin/Vendor
const createProduct = asyncHandler(async (req, res, next) => {
  let productData = req.body;

  // If the data was sent as a JSON string in FormData, parse it
  if (req.body.data) {
    try {
      productData = typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body.data;
    } catch (error) {
      throw new AppError("Invalid product data format", 400);
    }
  }

  // Destructure all fields with defaults from parsed data
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
    minOrderQuantity,
    maxOrderQuantity,
    taxClass,
    isReturnable,
    returnPeriod,
    warranty,
    customFields,
  } = productData; // Use parsed data instead of req.body

  // Validate category exists
  if (category) {
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      throw new AppError("Category not found", 404);
    }
  }
{/**
  // Validate subcategory belongs to category
  if (subCategory) {
    const subCategoryExists = await SubCategory.findOne({
      _id: subCategory,
      category: category,
    });
    if (!subCategoryExists) {
      throw new AppError("SubCategory not found or does not belong to selected category", 400);
    }
  }
     */}

  // Check SKU uniqueness
  if (sku) {
    const existingSKU = await Product.findOne({ sku: sku.trim() });
    if (existingSKU) {
      throw new AppError("Product with this SKU already exists", 400);
    }
  }

  // Check barcode uniqueness
  if (barcode) {
    const existingBarcode = await Product.findOne({ barcode: barcode.trim() });
    if (existingBarcode) {
      throw new AppError("Product with this barcode already exists", 400);
    }
  }

  // But keep req.files as is for image uploads
  let images = [];
  if (req.files && req.files.length > 0) {
    images = req.files.map((file, index) => ({
      url: `/uploads/products/${file.filename}`,
      alt: `${name} - Image ${index + 1}`,
      isPrimary: index === 0,
      order: index + 1,
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
    sku: sku?.trim(),
    barcode: barcode?.trim(),
    quantity: quantity || 0,
    lowStockThreshold: lowStockThreshold || 5,
    images,
    category,
    subCategory,
    tags: Array.isArray(tags) ? tags : [],
    brand,
    variants: Array.isArray(variants) ? variants : [],
    attributes: Array.isArray(attributes) ? attributes : [],
    metaTitle: metaTitle || name,
    metaDescription: metaDescription || shortDescription?.substring(0, 160),
    metaKeywords: Array.isArray(metaKeywords) ? metaKeywords : [],
    weight,
    dimensions,
    isPhysicalProduct: isPhysicalProduct !== undefined ? isPhysicalProduct : true,
    isDigitalProduct: isDigitalProduct || false,
    digitalFileUrl,
    shippingClass: shippingClass || "standard",
    freeShipping: freeShipping || false,
    status: status || "draft",
    isFeatured: isFeatured || false,
    visibility: visibility || "visible",
    discount,
    relatedProducts: Array.isArray(relatedProducts) ? relatedProducts : [],
    frequentlyBoughtTogether: Array.isArray(frequentlyBoughtTogether) ? frequentlyBoughtTogether : [],
    minOrderQuantity: minOrderQuantity || 1,
    maxOrderQuantity,
    taxClass: taxClass || "standard",
    isReturnable: isReturnable !== undefined ? isReturnable : true,
    returnPeriod: returnPeriod || 30,
    warranty,
    customFields: customFields || {},
  });

  // Populate references
  const populatedProduct = await Product.findById(product._id)
    .populate("category", "name slug image")
    .populate("subCategory", "name slug")

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: populatedProduct,
  });
});

// ==================== READ (ALL) ====================

// @desc    Get all products with filtering, pagination, search
// @route   GET /api/products
// @access  Public
const getAllProducts = asyncHandler(async (req, res, next) => {
  // Build filter object
  const filter = {};

  // Search functionality
  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, "i");
    filter.$or = [{ name: searchRegex }, { description: searchRegex }, { brand: searchRegex }, { sku: searchRegex }, { tags: { $in: [searchRegex] } }];
  }

  // Category filter
  if (req.query.category) {
    filter.category = req.query.category;
  }

  // SubCategory filter
  if (req.query.subCategory) {
    filter.subCategory = req.query.subCategory;
  }

  // Brand filter
  if (req.query.brand) {
    filter.brand = { $regex: req.query.brand, $options: "i" };
  }

  // Price range filter
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }

  // Status filter
  if (req.query.status) {
    filter.status = req.query.status;
  } else {
    // Public API shows only active products
    filter.status = "active";
  }

  // Featured filter
  if (req.query.isFeatured === "true") {
    filter.isFeatured = true;
  }

  // In stock only
  if (req.query.inStock === "true") {
    filter.quantity = { $gt: 0 };
  }

  // Has discount
  if (req.query.hasDiscount === "true") {
    filter["discount.isActive"] = true;
    filter["discount.startDate"] = { $lte: new Date() };
    filter["discount.endDate"] = { $gte: new Date() };
  }

  // Rating filter
  if (req.query.minRating) {
    filter.averageRating = { $gte: Number(req.query.minRating) };
  }

  // Tags filter (comma separated)
  if (req.query.tags) {
    filter.tags = {
      $in: req.query.tags.split(",").map((tag) => tag.trim().toLowerCase()),
    };
  }

  // Date range
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  // Execute query with APIFeatures
  const features = new APIFeatures(
    Product.find(filter).populate([
      { path: "category", select: "name slug image" },
      { path: "subCategory", select: "name slug" },
    ]),
    req.query,
  )
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [products, totalProducts] = await Promise.all([features.query.lean(), Product.countDocuments(filter)]);

  // Get price range for filters
  const priceRange = (await Product.getPriceRange) ? await Product.getPriceRange() : { min: 0, max: 0 };

  // Get available brands for filter sidebar
  const brands = await Product.distinct("brand", { status: "active" });

  res.status(200).json({
    success: true,
    results: products.length,
    total: totalProducts,
    pagination: {
      ...features.pagination,
      totalPages: Math.ceil(totalProducts / (features.pagination.limit || 10)),
    },
    filters: {
      priceRange,
      availableBrands: brands.filter(Boolean).sort(),
    },
    data: products,
  });
});

// ==================== READ (SPECIAL) ====================

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res, next) => {
  const limit = Math.min(parseInt(req.query.limit) || 8, 50);

  const products = await Product.find({
    isFeatured: true,
    status: "active",
    quantity: { $gt: 0 },
  })
    .sort("-createdAt")
    .limit(limit)
    .populate("category", "name slug")
    .select("name slug price compareAtPrice images averageRating totalReviews totalSold");

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get best selling products
// @route   GET /api/products/best-selling
// @access  Public
const getBestSellingProducts = asyncHandler(async (req, res, next) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const products = await Product.find({
    status: "active",
    totalSold: { $gt: 0 },
  })
    .sort("-totalSold")
    .limit(limit)
    .populate("category", "name slug")
    .select("name slug price compareAtPrice images averageRating totalSold");

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get new arrivals
// @route   GET /api/products/new-arrivals
// @access  Public
const getNewArrivals = asyncHandler(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const products = await Product.find({
    status: "active",
    createdAt: { $gte: sinceDate },
  })
    .sort("-createdAt")
    .limit(limit)
    .populate("category", "name slug")
    .select("name slug price compareAtPrice images averageRating createdAt");

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Get products from same category with similar price range
  const priceRange = { min: product.price * 0.7, max: product.price * 1.3 };

  const relatedProducts = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    status: "active",
    price: { $gte: priceRange.min, $lte: priceRange.max },
  })
    .limit(8)
    .populate("category", "name slug")
    .select("name slug price compareAtPrice images averageRating");

  res.status(200).json({
    success: true,
    count: relatedProducts.length,
    data: relatedProducts,
  });
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;

  // Verify category exists
  const categoryExists = await Category.findById(categoryId);
  if (!categoryExists) {
    throw new AppError("Category not found", 404);
  }

  const filter = {
    category: categoryId,
    status: "active",
  };

  // Additional filters
  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
  }
  if (req.query.brand) {
    filter.brand = { $regex: req.query.brand, $options: "i" };
  }
  if (req.query.subCategory) {
    filter.subCategory = req.query.subCategory;
  }

  const features = new APIFeatures(
    Product.find(filter)
      .populate("category", "name slug")
      .populate("subCategory", "name slug")
      .select("name slug price compareAtPrice images averageRating totalReviews brand"),
    req.query,
  )
    .filter()
    .sort()
    .paginate();

  const [products, totalProducts] = await Promise.all([features.query.lean(), Product.countDocuments(filter)]);

  // Get filter options
  const [brands, subCategories, priceRange] = await Promise.all([
    Product.distinct("brand", { category: categoryId, status: "active" }),
    SubCategory.find({ category: categoryId, isActive: true }).select("name slug").sort("name"),
    Product.aggregate([
      { $match: { category: new mongoose.Types.ObjectId(categoryId), status: "active" } },
      { $group: { _id: null, min: { $min: "$price" }, max: { $max: "$price" } } },
    ]),
  ]);

  res.status(200).json({
    success: true,
    results: products.length,
    total: totalProducts,
    pagination: {
      ...features.pagination,
      totalPages: Math.ceil(totalProducts / (features.pagination.limit || 10)),
    },
    filters: {
      availableBrands: brands.filter(Boolean).sort(),
      subCategories,
      priceRange: priceRange[0] || { min: 0, max: 0 },
    },
    data: products,
  });
});

// ==================== READ (SINGLE) ====================

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug description")
    .populate("subCategory", "name slug")
    .populate("relatedProducts", "name slug price images averageRating")
    .populate("frequentlyBoughtTogether", "name slug price images");

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Get review stats
  const Review = mongoose.model("Review");
  const reviewStats = await Review.aggregate([
    { $match: { productId: product._id, status: "approved" } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...product.toJSON(),
      reviewStats: reviewStats[0] || { averageRating: 0, totalReviews: 0 },
    },
  });
});

// @desc    Get product by slug
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate("category", "name slug description")
    .populate("subCategory", "name slug")
    .populate("relatedProducts", "name slug price images averageRating")
    .populate("frequentlyBoughtTogether", "name slug price images");

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// ==================== UPDATE ====================

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin/Vendor
const updateProduct = asyncHandler(async (req, res, next) => {
  // Find product
  let product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  let updateData = req.body;
  // If data comes as JSON string in FormData, parse it
  if (req.body.data) {
    try {
      updateData = typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body.data;
    } catch (error) {
      throw new AppError("Invalid update data format", 400);
    }
  }

  // Now destructure from the parsed data instead of req.body
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
    minOrderQuantity,
    maxOrderQuantity,
    taxClass,
    isReturnable,
    returnPeriod,
    warranty,
    customFields,
    removeImages, // ← This comes from frontend now
    primaryImage, // ← This comes from frontend now
  } = updateData; // ← Use parsed data, not req.body

  // Handle image uploads (req.files remains unchanged - files don't go through JSON)
  let updatedImages = [...product.images];
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file, index) => ({
      url: `/uploads/products/${file.filename}`,
      alt: `${name || product.name} - Image ${product.images.length + index + 1}`,
      isPrimary: product.images.length === 0 && index === 0,
      order: product.images.length + index + 1,
    }));
    updatedImages = [...updatedImages, ...newImages];
  }

  // Handle image removal
  if (removeImages && Array.isArray(removeImages)) {
    // Delete files from disk
    await Promise.all(
      removeImages.map(async (imageUrl) => {
        try {
          const filePath = path.join(process.cwd(), imageUrl);
          await deleteFile(filePath);
        } catch (err) {
          console.warn(`Failed to delete image: ${imageUrl}`, err.message);
        }
      }),
    );

    updatedImages = updatedImages.filter((img) => !removeImages.includes(img.url));
  }

  // Handle primary image update
  if (primaryImage && updatedImages.length > 0) {
    updatedImages = updatedImages.map((img) => ({
      ...img,
      isPrimary: img.url === primaryImage,
    }));

    // ✅ ADD: If primaryImage is set, ensure ONLY one image is primary
    const primaryCount = updatedImages.filter((img) => img.isPrimary).length;
    if (primaryCount > 1) {
      // Keep only the first match as primary
      let found = false;
      updatedImages = updatedImages.map((img) => {
        if (img.url === primaryImage) {
          if (!found) {
            found = true;
            return { ...img, isPrimary: true };
          }
        }
        return { ...img, isPrimary: false };
      });
    }
  }

  // Build the final update object from parsed fields
  const finalUpdateData = {
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
    images: updatedImages,
    category,
    subCategory,
    tags: Array.isArray(tags) ? tags : [],
    brand,
    variants: Array.isArray(variants) ? variants : [],
    attributes: Array.isArray(attributes) ? attributes : [],
    metaTitle,
    metaDescription,
    metaKeywords: Array.isArray(metaKeywords) ? metaKeywords : [],
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
    relatedProducts: Array.isArray(relatedProducts) ? relatedProducts : [],
    frequentlyBoughtTogether: Array.isArray(frequentlyBoughtTogether) ? frequentlyBoughtTogether : [],
    minOrderQuantity,
    maxOrderQuantity,
    taxClass,
    isReturnable,
    returnPeriod,
    warranty,
    customFields,
    updatedBy: req.user._id,
  };

  // Remove undefined fields to avoid overwriting with undefined
  Object.keys(finalUpdateData).forEach((key) => {
    if (finalUpdateData[key] === undefined) {
      delete finalUpdateData[key];
    }
  });

  // Update product
  const updatedProduct = await Product.findByIdAndUpdate(req.params.id, finalUpdateData, {
    new: true,
    runValidators: true,
  })
    .populate("category", "name slug")
    .populate("subCategory", "name slug")

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    data: updatedProduct,
  });
});
// ==================== DELETE ====================

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Soft delete - change status to inactive
  product.status = "inactive";
  product.updatedBy = req.user._id;
  await product.save();

  res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

// @desc    Hard delete product
// @route   DELETE /api/products/:id/permanent
// @access  Private/Admin
const permanentDeleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Delete associated images
  if (product.images && product.images.length > 0) {
    const imagePaths = product.images.map((img) => path.join(process.cwd(), img.url));
    await deleteFiles(imagePaths);
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Product permanently deleted",
  });
});

// @desc    Bulk delete products
// @route   DELETE /api/products/bulk
// @access  Private/Admin
const bulkDeleteProducts = asyncHandler(async (req, res, next) => {
  const { productIds } = req.body;

  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    throw new AppError("Please provide an array of product IDs", 400);
  }

  // Soft delete all
  const result = await Product.updateMany(
    { _id: { $in: productIds } },
    {
      status: "inactive",
      updatedBy: req.user._id,
      updatedAt: new Date(),
    },
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} products deleted successfully`,
  });
});

// ==================== STOCK MANAGEMENT ====================

// @desc    Update product stock
// @route   PATCH /api/products/:id/stock
// @access  Private/Admin/Vendor
const updateProductStock = asyncHandler(async (req, res, next) => {
  const { quantity, operation = "set" } = req.body;
  // operation: 'set', 'add', 'subtract'

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  let newQuantity;
  switch (operation) {
    case "add":
      newQuantity = product.quantity + Number(quantity);
      break;
    case "subtract":
      newQuantity = product.quantity - Number(quantity);
      if (newQuantity < 0) {
        throw new AppError("Insufficient stock", 400);
      }
      break;
    case "set":
    default:
      newQuantity = Number(quantity);
      break;
  }

  const oldQuantity = product.quantity;
  product.quantity = newQuantity;

  // Auto-update status based on stock
  if (newQuantity === 0 && product.status === "active") {
    product.status = "outOfStock";
  } else if (newQuantity > 0 && product.status === "outOfStock") {
    product.status = "active";
  }

  product.updatedBy = req.user._id;
  await product.save();

  // Low stock warning
  const isLowStock = newQuantity <= product.lowStockThreshold;

  res.status(200).json({
    success: true,
    message: "Stock updated successfully",
    data: {
      productId: product._id,
      name: product.name,
      oldQuantity,
      newQuantity: product.quantity,
      status: product.status,
      lowStock: isLowStock,
      warning: isLowStock ? `Low stock alert! Only ${newQuantity} items remaining.` : null,
    },
  });
});

// @desc    Get low stock products
// @route   GET /api/products/low-stock
// @access  Private/Admin
const getLowStockProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({
    status: "active",
    $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
  })
    .populate("category", "name")
    .select("name sku quantity lowStockThreshold")
    .sort("quantity");

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// ==================== STATUS MANAGEMENT ====================

// @desc    Update product status
// @route   PATCH /api/products/:id/status
// @access  Private/Admin
const updateProductStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const validStatuses = ["draft", "active", "inactive", "discontinued", "outOfStock"];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(", ")}`, 400);
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      status,
      updatedBy: req.user._id,
      ...(status === "active" && { publishedAt: new Date() }),
    },
    { new: true, runValidators: true },
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.status(200).json({
    success: true,
    message: `Product status updated to ${status}`,
    data: product,
  });
});

// @desc    Toggle featured status
// @route   PATCH /api/products/:id/toggle-featured
// @access  Private/Admin
const toggleFeatured = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  product.isFeatured = !product.isFeatured;
  product.updatedBy = req.user._id;
  await product.save();

  res.status(200).json({
    success: true,
    message: `Product ${product.isFeatured ? "added to" : "removed from"} featured`,
    data: { isFeatured: product.isFeatured },
  });
});

// ==================== VARIANT MANAGEMENT ====================

// @desc    Add product variant
// @route   POST /api/products/:id/variants
// @access  Private/Admin/Vendor
const addProductVariant = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const { name, value, sku, barcode, price, quantity, images } = req.body;

  // Validate required fields
  if (!name || !value) {
    throw new AppError("Variant name and value are required", 400);
  }

  // Check duplicate variant
  const existingVariant = product.variants.find((v) => v.name === name && v.value === value);
  if (existingVariant) {
    throw new AppError("This variant already exists", 400);
  }

  // Check SKU uniqueness
  if (sku) {
    const skuExists = await Product.findOne({
      "variants.sku": sku,
    });
    if (skuExists) {
      throw new AppError("Variant SKU already exists", 400);
    }
  }

  product.variants.push({
    name,
    value,
    sku,
    barcode,
    price: price || product.price,
    quantity: quantity || 0,
    images: images || [],
  });

  product.hasVariants = true;
  product.updatedBy = req.user._id;
  await product.save();

  res.status(201).json({
    success: true,
    message: "Variant added successfully",
    data: product.variants[product.variants.length - 1],
  });
});

// @desc    Update variant
// @route   PUT /api/products/:id/variants/:variantId
// @access  Private/Admin/Vendor
const updateVariant = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const variant = product.variants.id(req.params.variantId);
  if (!variant) {
    throw new AppError("Variant not found", 404);
  }

  // Update variant fields
  const allowedFields = ["name", "value", "sku", "barcode", "price", "quantity", "images"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      variant[field] = req.body[field];
    }
  });

  product.updatedBy = req.user._id;
  await product.save();

  res.status(200).json({
    success: true,
    message: "Variant updated successfully",
    data: variant,
  });
});

// @desc    Delete variant
// @route   DELETE /api/products/:id/variants/:variantId
// @access  Private/Admin/Vendor
const removeProductVariant = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const variant = product.variants.id(req.params.variantId);
  if (!variant) {
    throw new AppError("Variant not found", 404);
  }

  variant.deleteOne();

  if (product.variants.length === 0) {
    product.hasVariants = false;
  }

  product.updatedBy = req.user._id;
  await product.save();

  res.status(200).json({
    success: true,
    message: "Variant removed successfully",
  });
});

// ==================== BULK OPERATIONS ====================

// @desc    Bulk update products
// @route   PATCH /api/products/bulk
// @access  Private/Admin
const bulkUpdateProducts = asyncHandler(async (req, res, next) => {
  const { productIds, updates } = req.body;

  if (!productIds?.length || !updates) {
    throw new AppError("Please provide productIds and updates", 400);
  }

  // Allowed fields for bulk update
  const allowedFields = ["status", "isFeatured", "category", "brand", "freeShipping", "taxClass", "shippingClass"];

  const filteredUpdates = {};
  Object.keys(updates).forEach((key) => {
    if (allowedFields.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  if (Object.keys(filteredUpdates).length === 0) {
    throw new AppError("No valid fields to update", 400);
  }

  filteredUpdates.updatedBy = req.user._id;
  filteredUpdates.updatedAt = new Date();

  const result = await Product.updateMany({ _id: { $in: productIds } }, { $set: filteredUpdates });

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} products updated successfully`,
    data: {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    },
  });
});

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private/Admin
const getProductStats = asyncHandler(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalProducts: { $sum: 1 },
              activeProducts: {
                $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
              },
              outOfStockProducts: {
                $sum: { $cond: [{ $eq: ["$status", "outOfStock"] }, 1, 0] },
              },
              draftProducts: {
                $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
              },
              totalValue: {
                $sum: { $multiply: ["$price", "$quantity"] },
              },
              averagePrice: { $avg: "$price" },
              totalSold: { $sum: "$totalSold" },
              featuredProducts: {
                $sum: { $cond: ["$isFeatured", 1, 0] },
              },
            },
          },
        ],
        byCategory: [
          { $match: { status: "active" } },
          {
            $group: {
              _id: "$category",
              productCount: { $sum: 1 },
              avgPrice: { $avg: "$price" },
              totalValue: {
                $sum: { $multiply: ["$price", "$quantity"] },
              },
            },
          },
          { $sort: { productCount: -1 } },
          { $limit: 10 },
        ],
        byBrand: [
          { $match: { status: "active", brand: { $ne: null } } },
          {
            $group: {
              _id: "$brand",
              productCount: { $sum: 1 },
              avgPrice: { $avg: "$price" },
            },
          },
          { $sort: { productCount: -1 } },
          { $limit: 10 },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: stats[0],
  });
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res, next) => {
  const { q } = req.query;

  if (!q || q.trim().length < 2) {
    throw new AppError("Search query must be at least 2 characters", 400);
  }

  const searchRegex = new RegExp(q.trim(), "i");

  const features = new APIFeatures(
    Product.find({
      status: "active",
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { shortDescription: searchRegex },
        { brand: searchRegex },
        { tags: { $in: [searchRegex] } },
        { sku: searchRegex },
      ],
    }).populate("category", "name slug"),
    req.query,
  )
    .sort()
    .limitFields()
    .paginate();

  const [products, total] = await Promise.all([
    features.query.lean(),
    Product.countDocuments({
      status: "active",
      $or: [{ name: searchRegex }, { description: searchRegex }, { brand: searchRegex }],
    }),
  ]);

  res.status(200).json({
    success: true,
    query: q,
    results: products.length,
    total,
    pagination: features.pagination,
    data: products,
  });
});

export {
  createProduct,
  getAllProducts,
  getFeaturedProducts,
  getBestSellingProducts,
  getNewArrivals,
  getRelatedProducts,
  getProductsByCategory,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  permanentDeleteProduct,
  bulkDeleteProducts,
  updateProductStock,
  getLowStockProducts,
  updateProductStatus,
  toggleFeatured,
  addProductVariant,
  updateVariant,
  removeProductVariant,
  bulkUpdateProducts,
  getProductStats,
  searchProducts,
};
