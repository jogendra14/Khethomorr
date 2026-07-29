import Order from "../models/Order.js";
import sendEmail from "../utils/sendEmail.js";

// Create Order
const addOrderItems = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      address,
      paymentId,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "No order items",
      });
    }

    const order = new Order({
      userId: req.user._id,
      items,
      totalAmount,
      address,
      paymentId,
      paymentMethod,
      paymentStatus: paymentId ? "Paid" : "Pending",
    });

    const createdOrder = await order.save();

    // Order Confirmation Email
    const message = `
      <h2>Order Confirmation</h2>
      <p>Hello <strong>${req.user.name}</strong>,</p>

      <p>Your order has been placed successfully.</p>

      <p><strong>Order ID:</strong> ${createdOrder._id}</p>

      <p><strong>Total Amount:</strong> ₹${totalAmount}</p>

      <p>
        <strong>Delivery Address:</strong><br/>
        ${address.street}, ${address.city},
        ${address.postalCode}, ${address.country}
      </p>

      <p>Thank you for shopping with ShopNest ❤️</p>
    `;

    await sendEmail({
      email: req.user.email,
      subject: "ShopNest - Order Confirmation",
      message,
    });

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Logged In User Orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user._id,
    })
      .populate("items.productId", "name images price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Admin - Get All Orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "name email")
      .populate("items.productId", "name images price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get Single Order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.productId", "name images price");

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update Order Status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.status = req.body.status || order.status;

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Delete Order
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    await order.deleteOne();

    res.json({
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export {
  addOrderItems,
  getMyOrders,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};