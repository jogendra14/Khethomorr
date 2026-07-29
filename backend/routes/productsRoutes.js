import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controller/productController.js";
const upload = multer({dest: 'uploads/'});

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, upload.array("images", 5), createProduct);
router.route('/:id').get(getProductById).put(protect, admin, upload.array("images", 5), updateProduct).delete(protect, admin, deleteProduct);


export default router;
