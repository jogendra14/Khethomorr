import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    const totalProducts = await Product.countDocuments({});
    const totalUsers = await User.countDocuments({ role: 'user' });

    const [orders, statusCounts, recentOrders] = await Promise.all([
      Order.find({}).select("totalAmount status paymentStatus createdAt"),
      Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Order.find({})
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(6)
        .select("totalAmount status paymentStatus createdAt userId"),
    ]);
    const totalRevenue = orders.reduce((acc, item) => acc + Number(item.totalAmount || 0), 0);
    const statuses = Object.fromEntries(statusCounts.map(({ _id, count }) => [_id, count]));

    res.json({
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue,
      pendingOrders: statuses.Pending || 0,
      processingOrders: statuses.Processing || 0,
      deliveredOrders: statuses.Delivered || 0,
      recentOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getAdminStats };
