import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controller/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Create Order & Get All Orders (Admin)
router
  .route("/")
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

// Logged-in User Orders
router.get("/myorders", protect, getMyOrders);

// Get Single Order (Admin)
router.get("/:id", protect, admin, getOrderById);

// Update Order Status (Admin)
router.put("/:id/status", protect, admin, updateOrderStatus);

// Delete Order (Admin)
router.delete("/:id", protect, admin, deleteOrder);

export default router;
