// backend/routes/subCategoryRoutes.js
{/*
import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
//import { getProducts, getProductById, createProduct, updateProduct, duplicate, deleteProduct } from "../controller/productController.js";
//const upload = multer({dest: 'uploads/'});

const router = express.Router();

// Add sub-category to category
router.post('/', async (req, res) => {
  try {
    const { name, image, categoryId, status } = req.body;
    
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const newSubCategory = {
      name,
      image: image || null,
      status: status || 'Active',
      productsCount: 0,
    };

    category.subCategories.push(newSubCategory);
    await category.save();

    // Get the newly added sub-category
    const addedSub = category.subCategories[category.subCategories.length - 1];
    res.status(201).json(addedSub);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update sub-category
router.put('/:id', async (req, res) => {
  try {
    const { name, image, status } = req.body;
    
    const category = await Category.findOne({ 'subCategories._id': req.params.id });
    if (!category) {
      return res.status(404).json({ error: 'Sub-category not found' });
    }

    const subCategory = category.subCategories.id(req.params.id);
    if (name) subCategory.name = name;
    if (image !== undefined) subCategory.image = image;
    if (status) subCategory.status = status;

    await category.save();
    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete sub-category
router.delete('/:id', async (req, res) => {
  try {
    const category = await Category.findOne({ 'subCategories._id': req.params.id });
    if (!category) {
      return res.status(404).json({ error: 'Sub-category not found' });
    }

    // Remove sub-category
    category.subCategories = category.subCategories.filter(
      sub => sub._id.toString() !== req.params.id
    );
    await category.save();

    res.json({ message: 'Sub-category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;*/}