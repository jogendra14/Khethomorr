import express from "express";
import { getHomeContent, updateHomeContent } from "../controller/homeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.route("/").get(getHomeContent).put(protect, admin, updateHomeContent);

export default router;
