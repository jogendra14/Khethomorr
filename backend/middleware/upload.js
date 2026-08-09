import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import AppError from '../utils/AppError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * File Upload Middleware
 * Handles file uploads with multer
 */

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Determine upload directory based on file type
    if (file.fieldname === 'avatar') {
      uploadPath += 'avatars/';
    } else if (file.fieldname === 'images' || file.fieldname === 'image') {
      uploadPath += 'products/';
    } else if (file.fieldname === 'banner') {
      uploadPath += 'banners/';
    } else {
      uploadPath += 'misc/';
    }
    
    // Create full path
    const fullPath = path.join(__dirname, '..', uploadPath);
    
    // Ensure directory exists (use fs.mkdirSync in production)
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter - allow only images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (jpeg, jpg, png, gif, webp) are allowed!', 400), false);
  }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|xls|xlsx|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new AppError('Only document files are allowed!', 400), false);
  }
};

// Single image upload
export const uploadSingleImage = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
}).single('image');

// Single avatar upload
export const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: imageFilter
}).single('avatar');

// Multiple images upload (max 5)
export const uploadMultipleImages = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB each, max 5 files
  fileFilter: imageFilter
}).array('images', 5);

// Product images upload (max 10)
export const uploadProductImages = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB each, max 10 files
  fileFilter: imageFilter
}).array('images', 10);

// Multiple fields upload (for deals with image + banner)
export const uploadDealImages = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: imageFilter
}).fields([
  { name: 'image', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

// Document upload
export const uploadDocument = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: documentFilter
}).single('document');