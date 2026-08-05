// backend/routes/productsRoutes.js
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

// ✅ Multer Configuration for better file handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'), false);
  }
};

const upload = multer({ 
  dest: 'uploads/',
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

const router = express.Router();

// ============================
// ✅ PUBLIC ROUTES
// ============================
router.get('/', getProducts);
router.get('/:id', getProductById);

// ✅ Advanced Public Routes
router.get('/category/:category', getProductsByCategory);
router.get('/search/:query', searchProducts);

// ============================
// ✅ ADMIN ROUTES (Protected)
// ============================
router.post('/', protect, admin, upload.array("images", 10), createProduct);
router.put('/:id', protect, admin, upload.array("images", 10), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/duplicate', protect, admin, duplicateProduct);

// ✅ Bulk Operations
router.delete('/bulk', protect, admin, bulkDeleteProducts);

// ✅ Stock Management
router.patch('/:id/stock', protect, admin, updateProductStock);

// ============================
// ✅ EXPORT
// ============================
export default router;