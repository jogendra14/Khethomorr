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
    let { name, description, oldPrice, newPrice, category, subCategory, fanSize, stock, brand, discount, colors } = req.body;

    // 👇 2. IMPORTANT: Numbers ko explicitly Number type mein cast karein
    oldPrice = Number(oldPrice);
    newPrice = Number(newPrice);
    discount = Number(discount);
    stock = Number(stock);
    
     // 3. Colors parse karein
    const parsedColors = colors ? JSON.parse(colors) : [];
    
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
      colors: parsedColors,
      images,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, oldPrice, newPrice, category, subCategory, fanSize, stock, brand, discount, colors } = req.body;

    // 👇 IMPORTANT: Numbers ko forcefully Number banayein
    if (oldPrice) oldPrice = Number(oldPrice);
    if (newPrice) newPrice = Number(newPrice);
    if (discount) discount = Number(discount);
    if (stock) stock = Number(stock);

    const parsedColors = colors ? JSON.parse(colors) : [];
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.oldPrice = oldPrice || product.oldPrice;
      product.newPrice = newPrice || product.newPrice;
      product.category = category || product.category;
      product.subCategory = subCategory || product.subCategory;
      product.fanSize = fanSize || product.fanSize;
      product.stock = stock || product.stock;
      product.brand = brand || product.brand;
      product.discount = discount || product.discount;
      product.colors = parsedColors;

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
