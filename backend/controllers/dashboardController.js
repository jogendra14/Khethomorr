import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Review from '../models/Review.js';
import Payment from '../models/Payment.js';
import Deal from '../models/Deal.js';
import Coupon from '../models/Coupon.js';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * ============================================
 * DASHBOARD CONTROLLER - Advanced Admin Dashboard
 * ============================================
 * Features: Real-time stats, Charts data,
 * Sales analytics, Performance metrics
 */

// ==================== OVERVIEW ====================

// @desc    Get dashboard overview
// @route   GET /api/dashboard/overview
// @access  Private/Admin
const getDashboardOverview = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const thisWeek = new Date(today);
  thisWeek.setDate(thisWeek.getDate() - 7);
  
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  // Run all queries in parallel for performance
  const [
    // User metrics
    totalUsers,
    newUsersToday,
    newUsersYesterday,
    newUsersThisWeek,
    newUsersThisMonth,
    activeUsers,
    
    // Product metrics
    totalProducts,
    activeProducts,
    outOfStockProducts,
    lowStockProducts,
    draftProducts,
    
    // Order metrics
    totalOrders,
    ordersToday,
    ordersYesterday,
    ordersThisWeek,
    ordersThisMonth,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    
    // Revenue metrics
    revenueToday,
    revenueYesterday,
    revenueThisWeek,
    revenueThisMonth,
    revenueLastMonth,
    totalRevenue,
    averageOrderValue,
    
    // Payment metrics
    totalPayments,
    successfulPayments,
    failedPayments,
    refundedPayments,
    codPayments,
    onlinePayments,
    
    // Review metrics
    totalReviews,
    reviewsToday,
    averageRating,
    
    // Deal & Coupon metrics
    totalDeals,
    activeDeals,
    totalCoupons,
    activeCoupons,
    
    // Recent activities
    recentOrders,
    recentUsers,
    recentReviews,
    
    // Top data
    topSellingProducts,
    topCategories,
    topCustomers
  ] = await Promise.all([
    // User counts
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: today } }),
    User.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
    User.countDocuments({ createdAt: { $gte: thisWeek } }),
    User.countDocuments({ createdAt: { $gte: thisMonth } }),
    User.countDocuments({ isActive: true }),
    
    // Product counts
    Product.countDocuments(),
    Product.countDocuments({ status: 'active' }),
    Product.countDocuments({ status: 'outOfStock' }),
    Product.countDocuments({ 
      status: 'active',
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }),
    Product.countDocuments({ status: 'draft' }),
    
    // Order counts
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: today } }),
    Order.countDocuments({ createdAt: { $gte: yesterday, $lt: today } }),
    Order.countDocuments({ createdAt: { $gte: thisWeek } }),
    Order.countDocuments({ createdAt: { $gte: thisMonth } }),
    Order.countDocuments({ status: 'Pending' }),
    Order.countDocuments({ status: 'Processing' }),
    Order.countDocuments({ status: 'Shipped' }),
    Order.countDocuments({ status: 'Delivered' }),
    Order.countDocuments({ status: 'Cancelled' }),
    
    // Revenue calculations
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: yesterday, $lt: today } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: thisWeek } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: lastMonth, $lt: thisMonth } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, avg: { $avg: '$totalAmount' } } }
    ]),
    
    // Payment counts
    Payment.countDocuments(),
    Payment.countDocuments({ status: 'completed' }),
    Payment.countDocuments({ status: 'failed' }),
    Payment.countDocuments({ status: 'refunded' }),
    Payment.countDocuments({ paymentMethod: 'COD' }),
    Payment.countDocuments({ paymentMethod: { $ne: 'COD' } }),
    
    // Review metrics
    Review.countDocuments({ status: 'approved' }),
    Review.countDocuments({ createdAt: { $gte: today }, status: 'approved' }),
    Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]),
    
    // Deal & Coupon counts
    Deal.countDocuments(),
    Deal.countDocuments({ 
      status: 'active', 
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }),
    Coupon.countDocuments(),
    Coupon.countDocuments({ 
      isActive: true,
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() }
    }),
    
    // Recent activities
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email avatar')
      .select('orderNumber totalAmount status createdAt')
      .lean(),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email avatar role createdAt')
      .lean(),
    Review.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name avatar')
      .populate('productId', 'name images')
      .select('rating comment createdAt')
      .lean(),
    
    // Top selling products
    Order.aggregate([
      { $match: { status: { $in: ['Delivered', 'Shipped'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalSold: { $sum: '$items.qty' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
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
          image: { $arrayElemAt: ['$product.images.url', 0] },
          price: '$product.price',
          totalSold: 1,
          revenue: 1
        }
      }
    ]),
    
    // Top categories
    Order.aggregate([
      { $match: { status: { $in: ['Delivered', 'Shipped'] } } },
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
          orders: { $sum: 1 },
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
          orders: 1,
          revenue: 1
        }
      }
    ]),
    
    // Top customers
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          avatar: '$user.avatar',
          totalOrders: 1,
          totalSpent: 1,
          lastOrder: 1
        }
      }
    ])
  ]);

  // Calculate growth rates
  const userGrowth = newUsersYesterday > 0 
    ? Math.round(((newUsersToday - newUsersYesterday) / newUsersYesterday) * 100) 
    : 100;
    
  const orderGrowth = ordersYesterday > 0 
    ? Math.round(((ordersToday - ordersYesterday) / ordersYesterday) * 100) 
    : 100;
    
  const revenueGrowth = (revenueLastMonth[0]?.total || 0) > 0 
    ? Math.round(((revenueThisMonth[0]?.total || 0) - (revenueLastMonth[0]?.total || 0)) / (revenueLastMonth[0]?.total || 1) * 100)
    : 0;

  // Calculate conversion rate
  const conversionRate = totalUsers > 0 
    ? ((totalOrders / totalUsers) * 100).toFixed(1) 
    : 0;

  res.status(200).json({
    success: true,
    data: {
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          newThisWeek: newUsersThisWeek,
          newThisMonth: newUsersThisMonth,
          growth: userGrowth
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          outOfStock: outOfStockProducts,
          lowStock: lowStockProducts,
          draft: draftProducts
        },
        orders: {
          total: totalOrders,
          today: ordersToday,
          thisWeek: ordersThisWeek,
          thisMonth: ordersThisMonth,
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
          growth: orderGrowth
        },
        revenue: {
          today: revenueToday[0]?.total || 0,
          thisWeek: revenueThisWeek[0]?.total || 0,
          thisMonth: revenueThisMonth[0]?.total || 0,
          total: totalRevenue[0]?.total || 0,
          averageOrder: Math.round(averageOrderValue[0]?.avg || 0),
          growth: revenueGrowth
        },
        payments: {
          total: totalPayments,
          successful: successfulPayments,
          failed: failedPayments,
          refunded: refundedPayments,
          cod: codPayments,
          online: onlinePayments
        },
        reviews: {
          total: totalReviews,
          today: reviewsToday,
          averageRating: Math.round((averageRating[0]?.avg || 0) * 10) / 10
        },
        deals: {
          total: totalDeals,
          active: activeDeals
        },
        coupons: {
          total: totalCoupons,
          active: activeCoupons
        },
        conversionRate: parseFloat(conversionRate)
      },
      recent: {
        orders: recentOrders,
        users: recentUsers,
        reviews: recentReviews
      },
      top: {
        products: topSellingProducts,
        categories: topCategories,
        customers: topCustomers
      }
    }
  });
});

// ==================== SALES ANALYTICS ====================

// @desc    Get sales analytics data
// @route   GET /api/dashboard/sales-analytics
// @access  Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res, next) => {
  const { 
    period = '30days', // 7days, 30days, 90days, 1year
    startDate,
    endDate 
  } = req.query;

  // Calculate date range
  let dateFilter = {};
  const now = new Date();
  
  if (startDate && endDate) {
    dateFilter = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else {
    switch (period) {
      case '7days':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
        break;
      case '90days':
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 90)) };
        break;
      case '1year':
        dateFilter = { $gte: new Date(now.setFullYear(now.getFullYear() - 1)) };
        break;
      default: // 30days
        dateFilter = { $gte: new Date(now.setDate(now.getDate() - 30)) };
    }
  }

  const [
    salesTrend,
    revenueByPaymentMethod,
    ordersByStatus,
    hourlySales,
    dailySales,
    customerRetention,
    averageOrderValueTrend
  ] = await Promise.all([
    // Daily sales trend
    Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          itemsSold: { $sum: { $sum: '$items.qty' } }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Revenue by payment method
    Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$paymentMethod',
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { revenue: -1 } }
    ]),

    // Orders by status
    Order.aggregate([
      {
        $match: {
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      }
    ]),

    // Hourly sales (for time-based analysis)
    Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Daily sales summary
    Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Customer retention (repeat customers)
    Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' }
        }
      },
      {
        $group: {
          _id: null,
          newCustomers: { $sum: { $cond: [{ $eq: ['$orderCount', 1] }, 1, 0] } },
          repeatCustomers: { $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] } },
          totalCustomers: { $sum: 1 }
        }
      }
    ]),

    // Average order value trend
    Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: dateFilter
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          avgOrderValue: { $avg: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  // Calculate summary metrics
  const totalRevenue = salesTrend.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = salesTrend.reduce((sum, day) => sum + day.orders, 0);
  const totalItemsSold = salesTrend.reduce((sum, day) => sum + day.itemsSold, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Find peak sales day
  const peakDay = salesTrend.reduce((max, day) => 
    day.revenue > (max?.revenue || 0) ? day : max, null
  );

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalItemsSold,
        averageOrderValue: Math.round(avgOrderValue),
        peakDay: peakDay ? {
          date: peakDay._id,
          revenue: peakDay.revenue,
          orders: peakDay.orders
        } : null
      },
      charts: {
        salesTrend,
        revenueByPaymentMethod,
        ordersByStatus,
        hourlySales,
        dailySales,
        customerRetention: customerRetention[0] || {
          newCustomers: 0,
          repeatCustomers: 0,
          totalCustomers: 0
        },
        averageOrderValueTrend
      }
    }
  });
});

// ==================== PRODUCT ANALYTICS ====================

// @desc    Get product analytics
// @route   GET /api/dashboard/product-analytics
// @access  Private/Admin
const getProductAnalytics = asyncHandler(async (req, res, next) => {
  const [
    categoryDistribution,
    brandAnalytics,
    priceRangeDistribution,
    stockDistribution,
    topViewedProducts,
    topRatedProducts,
    productPerformance
  ] = await Promise.all([
    // Products per category
    Product.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$quantity' },
          totalSold: { $sum: '$totalSold' }
        }
      },
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
          name: '$category.name',
          count: 1,
          avgPrice: 1,
          totalStock: 1,
          totalSold: 1
        }
      },
      { $sort: { count: -1 } }
    ]),

    // Brand analytics
    Product.aggregate([
      { $match: { status: 'active', brand: { $ne: null } } },
      {
        $group: {
          _id: '$brand',
          products: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$quantity' },
          totalSold: { $sum: '$totalSold' },
          totalRevenue: { $sum: { $multiply: ['$price', '$totalSold'] } }
        }
      },
      { $sort: { products: -1 } },
      { $limit: 10 }
    ]),

    // Price range distribution
    Product.aggregate([
      { $match: { status: 'active' } },
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 500, 1000, 2000, 5000, 10000, 50000, 100000],
          default: '100000+',
          output: {
            count: { $sum: 1 },
            avgRating: { $avg: '$averageRating' }
          }
        }
      }
    ]),

    // Stock distribution
    Product.aggregate([
      { $match: { status: 'active' } },
      {
        $bucket: {
          groupBy: '$quantity',
          boundaries: [0, 5, 10, 20, 50, 100, 500],
          default: '500+',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]),

    // Top viewed products (if you track views)
    Product.find({ status: 'active' })
      .sort({ totalSold: -1 })
      .limit(10)
      .select('name price images totalSold averageRating totalReviews')
      .lean(),

    // Top rated products
    Product.find({ status: 'active', totalReviews: { $gt: 0 } })
      .sort({ averageRating: -1, totalReviews: -1 })
      .limit(10)
      .select('name price images averageRating totalReviews totalSold')
      .lean(),

    // Product performance (sold vs stock ratio)
    Product.aggregate([
      { $match: { status: 'active' } },
      {
        $project: {
          name: 1,
          price: 1,
          quantity: 1,
          totalSold: 1,
          sellThroughRate: {
            $cond: [
              { $gt: ['$quantity', 0] },
              { $divide: ['$totalSold', { $add: ['$quantity', '$totalSold'] }] },
              0
            ]
          }
        }
      },
      { $sort: { sellThroughRate: -1 } },
      { $limit: 20 }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      categoryDistribution,
      brandAnalytics,
      priceRangeDistribution,
      stockDistribution,
      topProducts: {
        bySales: topViewedProducts,
        byRating: topRatedProducts
      },
      productPerformance
    }
  });
});

// ==================== USER ANALYTICS ====================

// @desc    Get user analytics
// @route   GET /api/dashboard/user-analytics
// @access  Private/Admin
const getUserAnalytics = asyncHandler(async (req, res, next) => {
  const [
    registrationTrend,
    userByRole,
    userActivity,
    topSpenders,
    userRetention
  ] = await Promise.all([
    // Registration trend (last 12 months)
    User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),

    // Users by role
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          verified: { $sum: { $cond: ['$isEmailVerified', 1, 0] } }
        }
      }
    ]),

    // User activity (with orders)
    User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'userId',
          as: 'orders'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          role: 1,
          createdAt: 1,
          orderCount: { $size: '$orders' },
          totalSpent: {
            $sum: {
              $map: {
                input: '$orders',
                as: 'order',
                in: {
                  $cond: [
                    { $ne: ['$$order.status', 'Cancelled'] },
                    '$$order.totalAmount',
                    0
                  ]
                }
              }
            }
          }
        }
      },
      { $sort: { orderCount: -1 } },
      { $limit: 20 }
    ]),

    // Top spenders
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          lastOrder: { $max: '$createdAt' }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          name: '$user.name',
          email: '$user.email',
          totalOrders: 1,
          totalSpent: 1,
          avgOrderValue: 1,
          lastOrder: 1
        }
      }
    ]),

    // User retention (cohort analysis)
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: '$userId',
          firstOrder: { $min: '$createdAt' },
          lastOrder: { $max: '$createdAt' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$firstOrder'
            }
          },
          users: { $sum: 1 },
          avgOrdersPerUser: { $avg: '$orderCount' }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  res.status(200).json({
    success: true,
    data: {
      registrationTrend,
      userByRole,
      userActivity,
      topSpenders,
      userRetention
    }
  });
});

// ==================== REVENUE ANALYTICS ====================

// @desc    Get revenue analytics
// @route   GET /api/dashboard/revenue-analytics
// @access  Private/Admin
const getRevenueAnalytics = asyncHandler(async (req, res, next) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();

  const [
    monthlyRevenue,
    quarterlyRevenue,
    revenueByCategory,
    revenueByBrand,
    discountImpact,
    refundAnalytics
  ] = await Promise.all([
    // Monthly revenue for selected year
    Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]),

    // Quarterly revenue
    Order.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelled' },
          createdAt: {
            $gte: new Date(year - 1, 0, 1),
            $lt: new Date(year + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            quarter: { $ceil: { $divide: [{ $month: '$createdAt' }, 3] } }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.quarter': 1 } }
    ]),

    // Revenue by category
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
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
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          orders: { $sum: 1 },
          itemsSold: { $sum: '$items.qty' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
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
          name: '$category.name',
          revenue: 1,
          orders: 1,
          itemsSold: 1,
          percentage: { $literal: 0 } // Will calculate on frontend
        }
      }
    ]),

    // Revenue by brand
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
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
      { $match: { 'product.brand': { $ne: null } } },
      {
        $group: {
          _id: '$product.brand',
          revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } },
          itemsSold: { $sum: '$items.qty' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]),

    // Discount impact
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          ordersWithDiscount: { $sum: { $cond: [{ $gt: ['$discount', 0] }, 1, 0] } },
          totalRevenue: { $sum: '$totalAmount' },
          totalDiscount: { $sum: '$discount' },
          avgDiscount: { $avg: '$discount' }
        }
      }
    ]),

    // Refund analytics
    Payment.aggregate([
      { $match: { status: { $in: ['refunded', 'partially_refunded'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          refundCount: { $sum: 1 },
          totalRefunded: { $sum: '$refund.amount' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ])
  ]);

  // Calculate percentages for category revenue
  const totalCategoryRevenue = revenueByCategory.reduce((sum, cat) => sum + cat.revenue, 0);
  revenueByCategory.forEach(cat => {
    cat.percentage = totalCategoryRevenue > 0 
      ? Math.round((cat.revenue / totalCategoryRevenue) * 100) 
      : 0;
  });

  res.status(200).json({
    success: true,
    data: {
      monthlyRevenue,
      quarterlyRevenue,
      revenueByCategory,
      revenueByBrand,
      discountImpact: discountImpact[0] || {
        totalOrders: 0,
        ordersWithDiscount: 0,
        totalRevenue: 0,
        totalDiscount: 0,
        avgDiscount: 0
      },
      refundAnalytics
    }
  });
});

// ==================== REAL-TIME METRICS ====================

// @desc    Get real-time metrics
// @route   GET /api/dashboard/realtime
// @access  Private/Admin
const getRealTimeMetrics = asyncHandler(async (req, res, next) => {
  const lastHour = new Date(Date.now() - 60 * 60 * 1000);
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    activeVisitors, // Note: You'll need to track this separately (Redis/WebSocket)
    ordersLastHour,
    ordersLast24Hours,
    revenueLastHour,
    revenueLast24Hours,
    recentOrders,
    pendingOrders,
    lowStockAlerts
  ] = await Promise.all([
    // Placeholder for active visitors (implement with Redis/WebSocket)
    Promise.resolve(0),
    
    Order.countDocuments({ createdAt: { $gte: lastHour } }),
    Order.countDocuments({ createdAt: { $gte: last24Hours } }),
    
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: lastHour } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: last24Hours } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]),
    
    Order.find({ status: 'Pending' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .select('orderNumber totalAmount createdAt')
      .lean(),
      
    Order.countDocuments({ status: 'Pending' }),
    
    Product.find({
      status: 'active',
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    })
      .select('name quantity lowStockThreshold')
      .limit(10)
      .lean()
  ]);

  res.status(200).json({
    success: true,
    data: {
      realtime: {
        activeVisitors: activeVisitors || Math.floor(Math.random() * 100) + 10, // Mock data
        ordersLastHour,
        ordersLast24Hours,
        revenueLastHour: revenueLastHour[0]?.total || 0,
        revenueLast24Hours: revenueLast24Hours[0]?.total || 0,
        pendingOrders,
        lastUpdated: new Date()
      },
      alerts: {
        lowStock: lowStockAlerts,
        pendingOrders: recentOrders
      }
    }
  });
});

// @desc    Export dashboard data
// @route   GET /api/dashboard/export
// @access  Private/Admin
const exportDashboardData = asyncHandler(async (req, res, next) => {
  const { type = 'orders', format = 'json', startDate, endDate } = req.query;

  let data;
  let filename;

  switch (type) {
    case 'orders':
      data = await Order.find({
        createdAt: {
          $gte: startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30)),
          $lte: endDate ? new Date(endDate) : new Date()
        }
      })
        .populate('userId', 'name email')
        .lean();
      filename = 'orders-export';
      break;

    case 'products':
      data = await Product.find({})
        .populate('category', 'name')
        .lean();
      filename = 'products-export';
      break;

    case 'users':
      data = await User.find({})
        .select('-password -refreshToken')
        .lean();
      filename = 'users-export';
      break;

    case 'revenue':
      data = await Order.aggregate([
        {
          $match: {
            status: { $ne: 'Cancelled' },
            createdAt: {
              $gte: startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30)),
              $lte: endDate ? new Date(endDate) : new Date()
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      filename = 'revenue-export';
      break;

    default:
      throw new AppError('Invalid export type', 400);
  }

  if (format === 'csv') {
    // Convert to CSV (simplified - use proper CSV library in production)
    const csvData = data.map(item => Object.values(item).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}.csv`);
    return res.send(csvData);
  }

  res.status(200).json({
    success: true,
    type,
    count: data.length,
    data
  });
});

export {
  getDashboardOverview,
  getSalesAnalytics,
  getProductAnalytics,
  getUserAnalytics,
  getRevenueAnalytics,
  getRealTimeMetrics,
  exportDashboardData
};