// backend/routes/adminRoutes.js

import express from "express";
import { adminLogin, getUsers } from "../controller/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/login", adminLogin);
router.get("/users", protect, admin, getUsers); 

export default router;
