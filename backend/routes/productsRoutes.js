import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import {
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
} from "../controller/productController.js";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, "uploads/"),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}.${file.originalname.split(".").pop()}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    cb(file.mimetype.startsWith("image/") ? null : new Error("Only images are allowed"), file.mimetype.startsWith("image/"));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();

// Static routes must come before /:id so values such as "search" are not
// interpreted as product ids.
router.get("/category/:category", getProductsByCategory);
router.get("/search/:query", searchProducts);
router.get("/", getProducts);

router.delete("/bulk", protect, admin, bulkDeleteProducts);

router.get("/:id", getProductById);
router.post("/", protect, admin, upload.array("images", 10), createProduct);
router.put("/:id", protect, admin, upload.array("images", 10), updateProduct);
router.post("/:id/duplicate", protect, admin, duplicateProduct);
router.patch("/:id/stock", protect, admin, updateProductStock);
router.delete("/:id", protect, admin, deleteProduct);

export default router;
