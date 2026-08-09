import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Payment from '../models/Payment.js';
import Deal from '../models/Deal.js';
import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * ============================================
 * DASHBOARD CONTROLLER - Admin Dashboard
 * ============================================
 */

// @desc    Get dashboard overview stats
// @route   GET /api/dashboard/overview
// @access  Private/Admin
const getDashboardOverview = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const [
    totalUsers,
    newUsersThisMonth,
    totalProducts,
    activeProducts,
    totalOrders,
    ordersToday,
    totalRevenue,
    revenueThisMonth,
    revenueLastMonth,
    pendingOrders,
    lowStockProducts,
    newReviews,
    totalDeals,
    activeDeals,
    recentOrders
  ] = await Promise.all([
    // User stats
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: thisMonth } }),

    // Product stats
    Product.countDocuments(),
    Product.countDocuments({ status: 'active' }),

    // Order stats
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.aggregate([
      { $match: { status: 'Delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { status: 'Delivered', createdAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { status: 'Delivered', createdAt: { $gte: lastMonth, $lt: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.countDocuments({ status: 'Pending' }),
    Product.countDocuments({ 
      status: 'active',
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }),

    // Review stats
    Review.countDocuments({ createdAt: { $gte: today } }),

    // Deal stats
    Deal.countDocuments(),
    Deal.countDocuments({ status: 'active', isActive: true }),

    // Recent orders
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')
      .select('orderNumber totalAmount status createdAt')
      .lean()
  ]);

  // Revenue growth percentage
  const currentRevenue = revenueThisMonth[0]?.total || 0;
  const previousRevenue = revenueLastMonth[0]?.total || 0;
  const revenueGrowth = previousRevenue > 0 
    ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
    : 0;

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        lowStock: lowStockProducts
      },
      orders: {
        total: totalOrders,
        today: ordersToday,
        pending: pendingOrders,
        recent: recentOrders
      },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        thisMonth: currentRevenue,
        lastMonth: previousRevenue,
        growth: revenueGrowth
      },
      reviews: {
        newToday: newReviews
      },
      deals: {
        total: totalDeals,
        active: activeDeals
      }
    }
  });
});

// @desc    Get sales analytics
// @route   GET /api/dashboard/sales-analytics
// @access  Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;

  const salesData = await Order.aggregate([
    {
      $match: {
        status: { $in: ['Delivered', 'Shipped'] },
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - days))
        }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
        },
        orders: { $sum: 1 },
        revenue: { $sum: '$totalAmount' },
        avgOrderValue: { $avg: '$totalAmount' }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    {
      $match: {
        status: { $in: ['Delivered', 'Shipped'] },
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - days))
        }
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.productId',
        totalSold: { $sum: '$items.qty' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: 1,
        name: '$product.name',
        totalSold: 1,
        revenue: 1
      }
    }
  ]);

  // Top categories
  const topCategories = await Order.aggregate([
    {
      $match: {
        status: { $in: ['Delivered', 'Shipped'] },
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - days))
        }
      }
    },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.productId',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$product.category',
        totalSold: { $sum: '$items.qty' },
        revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
      }
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: '$category' },
    {
      $project: {
        _id: 1,
        name: '$category.name',
        totalSold: 1,
        revenue: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      salesTrend: salesData,
      topProducts,
      topCategories
    }
  });
});

// @desc    Get recent activities
// @route   GET /api/dashboard/activities
// @access  Private/Admin
const getRecentActivities = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 20;

  // Get recent orders
  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name')
    .select('orderNumber totalAmount status createdAt')
    .lean();

  // Get recent registrations
  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('name email role createdAt')
    .lean();

  // Get recent reviews
  const recentReviews = await Review.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('productId', 'name')
    .populate('userId', 'name')
    .select('rating comment createdAt')
    .lean();

  // Combine and sort activities
  const activities = [
    ...recentOrders.map(order => ({
      type: 'order',
      message: `New order #${order.orderNumber} by ${order.userId?.name}`,
      details: `Amount: ₹${order.totalAmount}, Status: ${order.status}`,
      timestamp: order.createdAt
    })),
    ...recentUsers.map(user => ({
      type: 'user',
      message: `${user.name} registered as ${user.role}`,
      details: `Email: ${user.email}`,
      timestamp: user.createdAt
    })),
    ...recentReviews.map(review => ({
      type: 'review',
      message: `${review.userId?.name} reviewed ${review.productId?.name}`,
      details: `Rating: ${review.rating}⭐ - "${review.comment.substring(0, 50)}..."`,
      timestamp: review.createdAt
    }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);

  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities
  });
});

export {
  getDashboardOverview,
  getSalesAnalytics,
  getRecentActivities
};