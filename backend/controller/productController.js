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
    let { category, subCategory, brand, name,  fanSize, color, fanWattage, fanVoltage, airDelivery, fanRpm, weight, oldPrice, newPrice, discount,warranty_guarantee, stock, description,  } = req.body;

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
      category,
      subCategory,
      brand,
      name,
      fanSize,
      color,
      fanWattage,
      fanVoltage,
      airDelivery,
      fanRpm,
      weight,
      oldPrice,
      newPrice,
      discount,
      warranty_guarantee,
      stock,
      description,
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
    const { category, subCategory, brand, name,  fanSize, color, fanWattage, fanVoltage, airDelivery, fanRpm, weight, oldPrice, newPrice, discount,warranty_guarantee, stock, description, existingImages } = req.body;
  
    const product = await Product.findById(req.params.id);
    if (product) {
      product.category = category || product.category;
      product.subCategory = subCategory || product.subCategory;
      product.brand = brand || product.brand;
      product.name = name || product.name;
      product.fanSize = fanSize || product.fanSize;
      product.color = color || product.color;
      product.fanWattage = fanWattage || product.fanWattage;
      product.fanVoltage = fanVoltage || product.fanVoltage;
      product.airDelivery = airDelivery || product.airDelivery;
      product.fanRpm = fanRpm || product.fanRpm;
      product.weight = weight || product.weight;
      product.oldPrice = oldPrice || product.oldPrice;
      product.newPrice = newPrice || product.newPrice;
      product.discount = discount || product.discount;
      product.warranty_guarantee = warranty_guarantee || product.warranty_guarantee;
      product.stock = stock || product.stock;
      product.description = description || product.description;

      // 🔥 इमेजेज को हैंडल करें
       let finalImages = [];
      // 1. पहले existingImages को पार्स करें (अगर भेजी गई हैं)
      if (existingImages) {
        try {
          const parsedExisting = JSON.parse(existingImages);
          finalImages = [...parsedExisting];
        }
        catch (e) {
          finalImages = [existingImages];
        }
      }
      else {
        finalImages = [...product.images];
      } 
      // 2. नई इमेजेज को क्लाउडिनरी पर अपलोड करें और जोड़ें
      if (req.files && req.files.length > 0) {
        const newImages = [];
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path);
          newImages.push(result.secure_url);
        }
        // नई इमेजेज को मौजूदा इमेजेज में जोड़ें
        finalImages = [...finalImages, ...newImages];
      }

      // 3. फाइनल इमेजेज सेट करें
      product.images = finalImages;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } 
    else {
      res.status(404).json({ message: "Product not found" });
    }
  } 
  catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Duplicate a product
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
    productData.name = `${productData.name}(Copy)`;
    
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
