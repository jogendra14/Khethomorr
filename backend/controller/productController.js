import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

const getProductById = async (req, res) => {
  try {
    const products = await Product.findById(req.params.id);
    if (products) {
      res.json(products);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
};

const createProduct = async (req, res) => {
  try {
    // 1. Sabse pehle req.body se data nikaalein
    const { name, description, oldPrice, newPrice, category, subCategory, fanSize, stock, brand, discount, color } = req.body;

    // 👇 2. IMPORTANT: Numbers ko explicitly Number type mein cast karein
    oldPrice = Number(oldPrice);
    newPrice = Number(newPrice);
    discount = Number(discount);
    stock = Number(stock);
       
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        images.push(result.secure_url);
      }
    }
    const product = new Product({
      name,
      description,
      oldPrice,
      newPrice,
      category,
      subCategory,
      fanSize,
      stock,
      brand,
      discount,
      color,
      images,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } 
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {

  try {
    const { name, description, oldPrice, newPrice, category, subCategory, fanSize, stock, brand, discount, color } = req.body;
  
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.oldPrice = oldPrice || product.oldPrice;
      product.newPrice = newPrice || product.newPrice;
      product.category = category || product.category;
      product.subCategory = subCategory || product.subCategory;
      product.fanSize = fanSize || product.fanSize;
      product.color = color || product.color;
      product.stock = stock || product.stock;
      product.brand = brand || product.brand;
      product.discount = discount || product.discount;

      if (req.files && req.files.length > 0) {
        const images = [];

        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path);
          images.push(result.secure_url);
        }
        product.images = images;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Duplicate a product
export const duplicate = async (req, res) => {

  try {
    const productId = req.params.id;
    
    // 1. Original product find karo
    const originalProduct = await Product.findById(productId);
    
    if (!originalProduct) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // 2. Product data copy karo (without _id, timestamps, etc.)
    const productData = originalProduct.toObject();
    delete productData._id;
    delete productData.createdAt;
    delete productData.updatedAt;
    delete productData.__v;

    // 3. Name mein "(Copy)" add karo
    productData.name = `${productData.name}`;
    
    // 4. Optional: Stock 0 kar do (recommended)
    //productData.stock = 0;

    // 5. New product create karo
    const duplicatedProduct = new Product(productData);
    await duplicatedProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product duplicated successfully',
      product: duplicatedProduct
    });

  } 
  catch (error) {
    console.error('Duplicate product error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to controller duplicate product',
      error: error.message
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
