import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import sendEmail from "../utils/sendEmail.js";

const validStatuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

const addOrderItems = async (req, res) => {
  try {
    const { items, address, paymentMethod = "COD" } = req.body;
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ message: "No order items" });
    }
    if (!address?.fullName?.trim() || !address?.street?.trim() || !address?.city?.trim() || !address?.postalCode?.trim() || !address?.country?.trim()) {
      return res.status(400).json({ message: "A complete delivery address is required" });
    }
    if (paymentMethod !== "COD") {
      return res.status(400).json({ message: "Online payment is not configured yet. Please choose Cash on Delivery." });
    }

    const requestedQuantities = new Map();
    for (const item of items) {
      if (!mongoose.isValidObjectId(item.productId) || !Number.isInteger(Number(item.qty)) || Number(item.qty) < 1) {
        return res.status(400).json({ message: "Each item needs a valid product and quantity" });
      }
      const productId = item.productId.toString();
      requestedQuantities.set(productId, (requestedQuantities.get(productId) || 0) + Number(item.qty));
    }

    const productIds = [...requestedQuantities.keys()];
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== productIds.length) {
      return res.status(404).json({ message: "One or more products are no longer available" });
    }

    const productById = new Map(products.map((product) => [product._id.toString(), product]));
    const orderItems = [];
    let totalAmount = 0;
    for (const [productId, qty] of requestedQuantities) {
      const product = productById.get(productId);
      if (product.stock < qty) {
        return res.status(409).json({ message: `${product.name} has only ${product.stock} item(s) left in stock` });
      }
      orderItems.push({ productId: product._id, qty, price: product.sellingPrice });
      totalAmount += product.sellingPrice * qty;
    }

    const decrementedItems = [];
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { new: true },
      );
      if (!updatedProduct) {
        await Product.bulkWrite(decrementedItems.map((decrementedItem) => ({
          updateOne: { filter: { _id: decrementedItem.productId }, update: { $inc: { stock: decrementedItem.qty } } },
        })));
        return res.status(409).json({ message: "Some items just went out of stock. Please refresh your cart." });
      }
      decrementedItems.push(item);
    }

    let order;
    try {
      order = await Order.create({
        userId: req.user._id,
        items: orderItems,
        totalAmount,
        address: {
          fullName: address.fullName.trim(),
          street: address.street.trim(),
          city: address.city.trim(),
          postalCode: address.postalCode.trim(),
          country: address.country.trim(),
        },
        paymentMethod: "COD",
        paymentStatus: "Pending",
      });
    } catch (error) {
      await Product.bulkWrite(decrementedItems.map((item) => ({
        updateOne: { filter: { _id: item.productId }, update: { $inc: { stock: item.qty } } },
      })));
      throw error;
    }

    try {
      await sendEmail({
        email: req.user.email,
        subject: "Khethomorr - Order Confirmation",
        message: `<h2>Order Confirmation</h2><p>Hello ${req.user.name},</p><p>Your order <strong>#${order._id}</strong> has been placed successfully.</p><p><strong>Total:</strong> ₹${totalAmount.toFixed(2)}</p>`,
      });
    } catch (emailError) {
      // A mail configuration issue must not make an already-created order look failed.
      console.error("Order confirmation email failed:", emailError.message);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to place order" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("items.productId", "name images sellingPrice")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrders = async (_req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "name email")
      .populate("items.productId", "name images sellingPrice")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.productId", "name images sellingPrice");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: "Invalid order id" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: "Unable to update order status" });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    await order.deleteOne();
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid order id" });
  }
};

export { addOrderItems, getMyOrders, getOrders, getOrderById, updateOrderStatus, deleteOrder };
