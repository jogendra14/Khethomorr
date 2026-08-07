// backend/controllers/productController.js

import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

// ✅ Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      productType,
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
      includeComponents,
      specifications,
    } = req.body;

    // Validate required fields
    if (
      !productType ||
      !category ||
      !name ||
      !MRP ||
      !sellingPrice ||
      stock === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Upload images to Cloudinary
    const images = [];
    
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      for (const file of imageFiles) {
        const result = await cloudinary.uploader.upload(file.tempFilePath || file.path, {
          folder: `products/${productType}`,
          resource_type: "auto",
        });

        images.push(result.secure_url);

        // Remove temp file after upload
        if (file.tempFilePath || file.path) {
          fs.unlink(file.tempFilePath || file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
          });
        }
      }
    }

    // Parse includeComponents and specifications if sent as string
    let parsedIncludeComponents = [];
    if (includeComponents) {
      parsedIncludeComponents = typeof includeComponents === "string"
        ? JSON.parse(includeComponents)
        : includeComponents;
    }

    let parsedSpecifications = new Map();
    if (specifications) {
      const specsObj = typeof specifications === "string"
        ? JSON.parse(specifications)
        : specifications;
      
      Object.entries(specsObj).forEach(([key, value]) => {
        parsedSpecifications.set(key, value);
      });
    }

    // Create product
    const product = await Product.create({
      productType,
      category,
      subCategory,
      brand,
      name,
      MRP: Number(MRP),
      sellingPrice: Number(sellingPrice),
      discount: discount || 0,
      rating: rating || 0,
      reviews: reviews || 0,
      choose_W_G: choose_W_G || "",
      warranty_guarantee: warranty_guarantee || "",
      stock: Number(stock),
      description: description || "",
      includeComponents: parsedIncludeComponents,
      images: images.length > 0 ? images : ["placeholder.jpg"], // Fallback if no images
      specifications: parsedSpecifications,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// ✅ Get All Products with filtering, sorting & pagination
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc",
      productType,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      inStock,
    } = req.query;

    // Build filter object
    const filter = {};

    if (productType) filter.productType = productType;
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (inStock === "true") filter.stock = { $gt: 0 };
    if (inStock === "false") filter.stock = 0;

    // Price range filter
    if (minPrice || maxPrice) {
      filter.sellingPrice = {};
      if (minPrice) filter.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) filter.sellingPrice.$lte = Number(maxPrice);
    }

    // Text search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortOrder = order === "asc" ? 1 : -1;

    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limitNum);

    const totalProducts = await Product.countDocuments(filter);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalProducts / limitNum),
        totalProducts,
        limit: limitNum,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ✅ Get Single Product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find existing product
    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Upload new images if provided
    if (req.files && req.files.images) {
      const imageFiles = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];

      const newImages = [];
      for (const file of imageFiles) {
        const result = await cloudinary.uploader.upload(file.tempFilePath || file.path, {
          folder: `products/${product.productType}`,
          resource_type: "auto",
        });
        newImages.push(result.secure_url);

        // Remove temp file
        if (file.tempFilePath || file.path) {
          fs.unlink(file.tempFilePath || file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err);
          });
        }
      }
      updateData.images = newImages;
    }

    // Parse includeComponents if string
    if (updateData.includeComponents && typeof updateData.includeComponents === "string") {
      updateData.includeComponents = JSON.parse(updateData.includeComponents);
    }

    // Parse specifications if string
    if (updateData.specifications && typeof updateData.specifications === "string") {
      const specsObj = JSON.parse(updateData.specifications);
      const specsMap = new Map();
      Object.entries(specsObj).forEach(([key, value]) => {
        specsMap.set(key, value);
      });
      updateData.specifications = specsMap;
    }

    // Update product
    product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// ✅ Get Product Types (for dropdowns)
export const getProductTypes = async (req, res) => {
  try {
    const types = Product.schema.path("productType").enumValues;

    res.status(200).json({
      success: true,
      productTypes: types,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product types",
      error: error.message,
    });
  }
};

// ✅ Get Product Count by Type (for dashboard)
export const getProductCountByType = async (req, res) => {
  try {
    const counts = await Product.aggregate([
      {
        $group: {
          _id: "$productType",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    counts.forEach((item) => {
      result[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      productCounts: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product counts",
      error: error.message,
    });
  }
};

// ✅ Get Template Fields for Product Type
export const getTemplateFields = async (req, res) => {
  try {
    const { productType } = req.params;
    const fields = Product.getTemplateFields(productType);

    res.status(200).json({
      success: true,
      templateFields: fields,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch template fields",
      error: error.message,
    });
  }
};

// ✅ Bulk Delete Products
export const bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of product IDs",
      });
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete products",
      error: error.message,
    });
  }
};