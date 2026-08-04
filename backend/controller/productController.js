import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import fs from 'fs';

console.log('mongoose is:', typeof mongoose);
// ============================
// ✅ GET ALL PRODUCTS
// ============================
const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      subCategory, 
      brand, 
      minPrice, 
      maxPrice,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 100,
      search 
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (brand) filter.brand = brand;
    
    if (minPrice || maxPrice) {
      filter.newPrice = {};
      if (minPrice) filter.newPrice.$gte = Number(minPrice);
      if (maxPrice) filter.newPrice.$lte = Number(maxPrice);
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sort] = order === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// ✅ GET PRODUCT BY ID
// ============================
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const formattedProduct = {
        ...product.toObject(),
        specifications: product.getSpecs()
      };
      res.json(formattedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Get product by id error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================
// ✅ CREATE PRODUCT
// ============================
const createProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Files received:", req.files?.length || 0);

    const {
      category,
      subCategory,
      brand,
      name,
      MRP,
      sellingPrice, 
      discount,
      stock,
      includeComponents,
      description,
      productType = 'fan',
      specifications = {}
    } = req.body;

    // Validate required fields
    if (!category || !brand || !name || !MRP || !sellingPrice || !stock) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: category, brand, name, MRP, sellingPrice, stock are required"
      });
    }

    // String ko array mein convert karo
    if (typeof includeComponents === 'string' && includeComponents.trim()) {
      includeComponents = includeComponents.split(',').map(item => item.trim());
    } else {
      includeComponents = [];
    }

    const productData = {
      category,
      subCategory,
      brand,
      name,
      MRP: Number(MRP),
      sellingPrice: Number(sellingPrice),
      discount: Number(discount),
      stock: Number(stock),
      includeComponents,
      description: description || '',
      productType: productType || 'fan',
      specifications: new Map()
    };

    // Handle images upload
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path);
          images.push(result.secure_url);
          // Delete temporary file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
          // Continue with other images even if one fails
        }
      }
    }
    productData.images = images;

    // Handle specifications - parse JSON if string
    let specObj = {};
    if (typeof specifications === 'string') {
      try {
        specObj = JSON.parse(specifications);
      } catch (e) {
        console.error("Failed to parse specifications JSON:", e);
        specObj = {};
      }
    } else if (typeof specifications === 'object') {
      specObj = specifications;
    }

    // Convert specifications to Map
    const specMap = new Map();
    Object.entries(specObj).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        specMap.set(key, value);
      }
    });

    // Also check for individual field values from form data
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
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: createdProduct
    });
    
  } catch (error) {
    console.error("Create product error:", error);
    // Send detailed error for debugging
    res.status(500).json({ 
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
      return res.status(404).json({ message: "Product not found" });
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
      description,
      productType,
      existingImages,
      specifications
    } = req.body;

    // Update basic fields
    if (category) product.category = category;
    if (subCategory) product.subCategory = subCategory;
    if (brand) product.brand = brand;
    if (name) product.name = name;
    if (MRP) product.MRP = Number(MRP);
    if (sellingPrice) product.sellingPrice = Number(sellingPrice);
    if (discount) product.discount = Number(discount);
    if (rating) product.rating = Number(rating);
    if (reviews) product.reviews = Number(reviews);
    if (choose_W_G !== undefined) product.choose_W_G = choose_W_G;
    if (warranty_guarantee !== undefined) product.warranty_guarantee = warranty_guarantee;
    if (stock) product.stock = Number(stock);
    if (description) product.description = description;
    if (productType) product.productType = productType;

    // Update specifications
    const specMap = product.specifications || new Map();

    if (specifications && typeof specifications === 'object') {
      Object.entries(specifications).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          specMap.set(key, value);
        } else if (value === null || value === '') {
          specMap.delete(key);
        }
      });
    }

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
          const result = await cloudinary.uploader.upload(file.path);
          newImages.push(result.secure_url);
          fs.unlinkSync(file.path);
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
    res.status(500).json({ message: error.message });
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
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          const publicId = imageUrl.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
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
    res.status(500).json({ message: error.message });
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
  deleteProduct
};