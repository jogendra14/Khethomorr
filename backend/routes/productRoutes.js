// backend/routes/productRoutes.js

import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductTypes,
  getProductCountByType,
  getTemplateFields,
  bulkDeleteProducts,
} from "../controller/productController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// ✅ Product Types & Templates Routes
router.get("/types", getProductTypes);
router.get("/count-by-type", getProductCountByType);
router.get("/template-fields/:productType", getTemplateFields);

// ✅ CRUD Routes
router.post("/create", upload.array("images", 10), createProduct);
router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.put("/:id", upload.array("images", 10), updateProduct);
router.delete("/:id", deleteProduct);

// ✅ Bulk Operations
router.post("/bulk-delete", bulkDeleteProducts);

export default router;