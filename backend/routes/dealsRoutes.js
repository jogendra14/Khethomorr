import express from "express";
import multer from "multer";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";
import { getDeals, getDealsById, createDeals, updateDeals, deleteDeals } from "../controller/dealsController.js";
const upload = multer({dest: 'uploads/'});

const router = express.Router();

router.route('/').get(getDeals).post(protect, admin, upload.single("image"), createDeals);
router.route('/:id').get(getDealsById).put(protect, admin, upload.single("image"), updateDeals).delete(protect, admin, deleteDeals);

export default router;
