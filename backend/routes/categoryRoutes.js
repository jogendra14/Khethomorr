// backend/routes/categoryRoutes.js
import express from "express";
import { getCategories, createCategory } from "../controller/categoryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// IMPORTANT: The base path for this router will be '/api/admin' in index.js
// So this route will become: /api/admin/categories
router.route("/categories")
  .get(protect, admin, getCategories)
  .post(protect, admin, createCategory);

// Optional: Add routes for single category operations
// router.route("/categories/:id")
//   .put(protect, admin, updateCategory)
//   .delete(protect, admin, deleteCategory);

export default router;