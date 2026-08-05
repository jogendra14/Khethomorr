import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import fs from 'fs';

const hasValue = (value) => value !== undefined && value !== null && value !== "";
const isNonNegativeNumber = (value) => Number.isFinite(Number(value)) && Number(value) >= 0;

// ============================
// ✅ GET ALL PRODUCTS (with pagination, filters, search)
// ============================
const getProducts = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      brand,
      minPrice,
      maxPrice,
      sort = "createdAt",
      order = "desc",
      page = 1,
      limit = 20,
      search,
    } = req.query;

    // Pagination values
    const currentPage = Math.max(Number(page) || 1, 1);
    const productsPerPage = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const skip = (currentPage - 1) * productsPerPage;

    // Build filter
    const filter = {};

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (brand) filter.brand = brand;

    // Price filter
    if (minPrice || maxPrice) {
      filter.sellingPrice = {};
      if (minPrice) filter.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) filter.sellingPrice.$lte = Number(maxPrice);
    }

    // Search
    if (search?.trim()) {
      const searchValue = search.trim();
      filter.$or = [
        { name: { $regex: searchValue, $options: "i" } },
        { description: { $regex: searchValue, $options: "i" } },
        { category: { $regex: searchValue, $options: "i" } },
        { brand: { $regex: searchValue, $options: "i" } },
      ];
    }

    // Sorting
    const allowedSortFields = ["createdAt", "sellingPrice", "rating", "name"];
    const sortField = allowedSortFields.includes(sort) ? sort : "createdAt";
    const sortOrder = order === "asc" ? 1 : -1;
    const sortOptions = { [sortField]: sortOrder };

    // Get products
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(productsPerPage)
      .lean();

    // Total count
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / productsPerPage);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: currentPage,
        limit: productsPerPage,
        pages: totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });

  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================
// ✅ GET PRODUCT BY ID
// ============================
const getProductById = async (req, res) => {
  try {
    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    const formattedProduct = {
      ...product.toObject(),
      specifications: product.getSpecs()
    };

    res.json({
      success: true,
      ...formattedProduct
    });
    
  } catch (error) {
    console.error("Get product by id error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
};

// ============================
// ✅ CREATE PRODUCT
// ============================
const createProduct = async (req, res) => {
  try {
    console.log("📦 Creating product...");
    console.log("Body:", req.body);
    console.log("Files:", req.files?.length || 0);

    const {
      category,
      subCategory,
      brand,
      name,
      MRP,
      sellingPrice, 
      discount,
      rating,
      reviews,
      choose_W_G,
      warranty_guarantee,
      stock,
      includeComponents,
      description,
      productType = 'fan',
      specifications = {}
    } = req.body;

    // Validate required fields
    const requiredFields = ['category', 'subCategory', 'brand', 'name', 'MRP', 'sellingPrice', 'stock'];
    for (const field of requiredFields) {
      if (!hasValue(req.body[field])) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        });
      }
    }

    if (![MRP, sellingPrice, stock].every(isNonNegativeNumber)) {
      return res.status(400).json({ success: false, message: "Prices and stock must be valid non-negative numbers" });
    }
    if (Number(sellingPrice) > Number(MRP)) {
      return res.status(400).json({ success: false, message: "Selling price cannot exceed MRP" });
    }
    if (hasValue(discount) && (!isNonNegativeNumber(discount) || Number(discount) > 100)) {
      return res.status(400).json({ success: false, message: "Discount must be between 0 and 100" });
    }
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: "At least one product image is required" });
    }

    // ✅ Convert includeComponents to array
    let includeComponentsArray = [];
    if (typeof includeComponents === 'string' && includeComponents.trim()) {
      includeComponentsArray = includeComponents.split(',').map(item => item.trim());
    } else if (Array.isArray(includeComponents)) {
      includeComponentsArray = includeComponents;
    }

    // Create product data
    const productData = {
      category,
      subCategory: subCategory || '',
      brand,
      name,
      MRP: Number(MRP),
      sellingPrice: Number(sellingPrice),
      discount: discount ? Number(discount) : 0,
      rating: rating ? Number(rating) : 0,
      reviews: reviews ? Number(reviews) : 0,
      choose_W_G: choose_W_G || '',
      warranty_guarantee: warranty_guarantee || '',
      stock: Number(stock),
      includeComponents: includeComponentsArray,
      description: description || '',
      productType: productType || 'fan',
      specifications: new Map()
    };

    // Handle images upload
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'products'
          });
          images.push(result.secure_url);
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
        }
      }
    }
    if (!images.length) {
      return res.status(502).json({ success: false, message: "Product images could not be uploaded" });
    }
    productData.images = images;

    // Handle specifications
    let specObj = {};
    if (typeof specifications === 'string') {
      try {
        specObj = JSON.parse(specifications);
      } catch (e) {
        console.error("Failed to parse specifications JSON:", e);
      }
    } else if (typeof specifications === 'object') {
      specObj = specifications;
    }

    const specMap = new Map();
    Object.entries(specObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        specMap.set(key, value);
      }
    });

    // Individual fields
    const individualFields = [
      'fanDesign', 'color', 'motor', 'sweepSize', 'bladeCount', 
      'material', 'fanWattage', 'airDelivery', 'fanRpm', 'weight',
      'chimneyType', 'chimneySize', 'motorPower', 'suctionCapacity', 
      'filterType', 'noiseLevel', 'controlType', 'lighting',
      'processor', 'ram', 'storage', 'display', 'battery', 
      'operatingSystem', 'connectivity', 'dimensions',
      'size', 'fit', 'pattern', 'season', 'careInstructions',
      'style', 'finish', 'assemblyRequired', 'power', 'capacity',
      'features', 'ipRating', 'warranty'
    ];

    individualFields.forEach(field => {
      if (req.body[field] !== undefined && req.body[field] !== null && req.body[field] !== '') {
        specMap.set(field, req.body[field]);
      }
    });

    productData.specifications = specMap;

    const product = new Product(productData);
    const createdProduct = await product.save();
    
    console.log("✅ Product created successfully!");
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: createdProduct
    });
    
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Server error",
    });
  }
};

// ============================
// ✅ UPDATE PRODUCT
// ============================
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    const {
      category,
      subCategory,
      brand,
      name,
      MRP,
      sellingPrice,
      discount,
      rating,
      reviews,
      choose_W_G,
      warranty_guarantee,
      stock,
      includeComponents,
      description,
      productType,
      existingImages,
      specifications
    } = req.body;

    // Update basic fields
    if (hasValue(category)) product.category = category;
    if (subCategory !== undefined) product.subCategory = subCategory;
    if (hasValue(brand)) product.brand = brand;
    if (hasValue(name)) product.name = name;
    if (hasValue(MRP)) product.MRP = Number(MRP);
    if (hasValue(sellingPrice)) product.sellingPrice = Number(sellingPrice);
    if (hasValue(discount)) product.discount = Number(discount);
    if (hasValue(rating)) product.rating = Number(rating);
    if (hasValue(reviews)) product.reviews = Number(reviews);
    if (choose_W_G !== undefined) product.choose_W_G = choose_W_G;
    if (warranty_guarantee !== undefined) product.warranty_guarantee = warranty_guarantee;
    if (hasValue(stock)) product.stock = Number(stock);

    if (![product.MRP, product.sellingPrice, product.stock].every(isNonNegativeNumber)) {
      return res.status(400).json({ success: false, message: "Prices and stock must be valid non-negative numbers" });
    }
    if (product.sellingPrice > product.MRP) {
      return res.status(400).json({ success: false, message: "Selling price cannot exceed MRP" });
    }
    if (!isNonNegativeNumber(product.discount) || product.discount > 100) {
      return res.status(400).json({ success: false, message: "Discount must be between 0 and 100" });
    }

    // Include Components
    if (includeComponents !== undefined) {
      let includeComponentsList = [];
      if (typeof includeComponents === 'string' && includeComponents.trim()) {
        includeComponentsList = includeComponents.split(',').map(item => item.trim());
      } else if (Array.isArray(includeComponents)) {
        includeComponentsList = includeComponents;
      }
      product.includeComponents = includeComponentsList;
    }

    if (description !== undefined) product.description = description;
    if (productType !== undefined) product.productType = productType;

    // Specifications
    let specObj = {};
    if (typeof specifications === 'string') {
      try {
        specObj = JSON.parse(specifications);
      } catch (e) {
        console.error("Failed to parse specs JSON:", e);
      }
    } else if (typeof specifications === 'object' && specifications !== null) {
      specObj = specifications;
    }

    const specMap = product.specifications || new Map();
    Object.entries(specObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        specMap.set(key, value);
      } else if (value === null || value === '') {
        specMap.delete(key);
      }
    });

    product.specifications = specMap;

    // Handle images
    let finalImages = [];
    
    if (existingImages) {
      try {
        const parsedExisting = typeof existingImages === 'string' 
          ? JSON.parse(existingImages) 
          : existingImages;
        finalImages = Array.isArray(parsedExisting) ? parsedExisting : [parsedExisting];
      } catch (e) {
        finalImages = [existingImages];
      }
    } else {
      finalImages = product.images || [];
    }

    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'products'
          });
          newImages.push(result.secure_url);
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
        }
      }
      finalImages = [...finalImages, ...newImages];
    }

    product.images = finalImages;

    const updatedProduct = await product.save();
    
    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });

  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Server error" 
    });
  }
};

// ============================
// ✅ DUPLICATE PRODUCT
// ============================
const duplicateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const originalProduct = await Product.findById(productId);

    if (!originalProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const productData = originalProduct.toObject();
    delete productData._id;
    delete productData.createdAt;
    delete productData.updatedAt;
    delete productData.__v;

    productData.name = `${productData.name} (Copy)`;

    const duplicatedProduct = new Product(productData);
    await duplicatedProduct.save();

    res.status(201).json({
      success: true,
      message: "Product duplicated successfully",
      product: duplicatedProduct,
    });
  } catch (error) {
    console.error("Duplicate product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to duplicate product",
      error: error.message,
    });
  }
};

// ============================
// ✅ DELETE PRODUCT
// ============================
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(`products/${publicId}`);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
        }
      }
    }

    await product.deleteOne();
    res.json({ 
      success: true,
      message: "Product removed successfully" 
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// ============================
// ✅ GET PRODUCTS BY CATEGORY
// ============================
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 20, sort = "createdAt", order = "desc" } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const productsPerPage = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const skip = (currentPage - 1) * productsPerPage;

    const filter = { category };
    const sortOptions = { [sort]: order === "asc" ? 1 : -1 };

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(productsPerPage)
      .lean();

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / productsPerPage);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: currentPage,
        limit: productsPerPage,
        pages: totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================
// ✅ SEARCH PRODUCTS
// ============================
const searchProducts = async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.json({
        success: true,
        products: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          pages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const productsPerPage = Math.min(Math.max(Number(limit) || 20, 1), 50);
    const skip = (currentPage - 1) * productsPerPage;

    const searchValue = query.trim();
    const filter = {
      $or: [
        { name: { $regex: searchValue, $options: "i" } },
        { description: { $regex: searchValue, $options: "i" } },
        { category: { $regex: searchValue, $options: "i" } },
        { brand: { $regex: searchValue, $options: "i" } },
      ]
    };

    const products = await Product.find(filter)
      .skip(skip)
      .limit(productsPerPage)
      .lean();

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / productsPerPage);

    res.json({
      success: true,
      products,
      pagination: {
        total,
        page: currentPage,
        limit: productsPerPage,
        pages: totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    });
  } catch (error) {
    console.error("Search products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================
// ✅ BULK DELETE PRODUCTS
// ============================
const bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product IDs are required",
      });
    }

    const products = await Product.find({ _id: { $in: ids } });
    
    // Delete images from Cloudinary
    for (const product of products) {
      if (product.images && product.images.length > 0) {
        for (const imageUrl of product.images) {
          try {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`products/${publicId}`);
          } catch (error) {
            console.error("Error deleting image from Cloudinary:", error);
          }
        }
      }
    }

    await Product.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${ids.length} products deleted successfully`,
    });
  } catch (error) {
    console.error("Bulk delete products error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================
// ✅ UPDATE PRODUCT STOCK
// ============================
const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    if (stock === undefined || stock === null) {
      return res.status(400).json({
        success: false,
        message: "Stock value is required",
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (!isNonNegativeNumber(stock)) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a valid non-negative number",
      });
    }

    product.stock = Number(stock);
    await product.save();

    res.json({
      success: true,
      message: "Stock updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update stock error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================
// ✅ EXPORT ALL FUNCTIONS
// ============================
export {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  duplicateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  bulkDeleteProducts,
  updateProductStock,
};
