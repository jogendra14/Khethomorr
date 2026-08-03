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
  deleteProduct 
} from "../controller/productController.js"; 

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

// ✅ Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// ✅ Admin routes
router.post('/', protect, admin, upload.array("images", 10), createProduct);
router.put('/:id', protect, admin, upload.array("images", 10), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/duplicate', protect, admin, duplicateProduct);

export default router;