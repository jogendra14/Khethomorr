import Deal from '../models/Deal.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';
import { deleteFile } from '../utils/fileManager.js';
import cloudinary from '../config/cloudinary.js';

/**
 * ============================================
 * DEAL CONTROLLER - Complete Deal/Offer Management
 * ============================================
 */

// ==================== CREATE ====================

// @desc    Create new deal
// @route   POST /api/deals
// @access  Private/Admin
const createDeal = asyncHandler(async (req, res, next) => {
  const {
    title, description, brand, originalPrice, dealPrice,
    discountType, startDate, endDate, productId, category,
    tags, couponCode, usageLimit, priority, isFeatured,
    targetAudience, platforms
  } = req.body;

  // Validate required fields
  if (!title || !brand || !originalPrice || !dealPrice) {
    throw new AppError('Please provide title, brand, originalPrice and dealPrice', 400);
  }

  // Validate pricing
  if (Number(dealPrice) >= Number(originalPrice)) {
    throw new AppError('Deal price must be less than original price', 400);
  }

  // Validate dates
  if (startDate && new Date(startDate) < new Date()) {
    throw new AppError('Start date must be in the future', 400);
  }

  if (endDate && startDate && new Date(endDate) <= new Date(startDate)) {
    throw new AppError('End date must be after start date', 400);
  }

  // Handle image upload to Cloudinary
  let imageUrl = null;
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'deals',
        width: 800,
        height: 500,
        crop: 'fill'
      });
      imageUrl = result.secure_url;
      
      // Delete local file after upload
      await deleteFile(req.file.path);
    } catch (error) {
      throw new AppError('Image upload failed: ' + error.message, 500);
    }
  }

  // Handle banner upload
  let bannerUrl = null;
  if (req.files?.banner?.[0]) {
    const result = await cloudinary.uploader.upload(req.files.banner[0].path, {
      folder: 'deals/banners',
      width: 1200,
      height: 400,
      crop: 'fill'
    });
    bannerUrl = result.secure_url;
    await deleteFile(req.files.banner[0].path);
  }

  // Create deal
  const deal = await Deal.create({
    title,
    description,
    brand,
    image: imageUrl || 'default-deal.png',
    banner: bannerUrl,
    originalPrice: Number(originalPrice),
    dealPrice: Number(dealPrice),
    discountType: discountType || 'percentage',
    startDate: startDate || new Date(),
    endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days default
    productId,
    category,
    tags: Array.isArray(tags) ? tags : [],
    couponCode: couponCode?.toUpperCase(),
    usageLimit,
    priority: priority || 0,
    isFeatured: isFeatured || false,
    targetAudience,
    platforms: platforms || { web: true, mobile: true, app: true },
    status: 'active',
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Deal created successfully',
    data: deal
  });
});

// ==================== READ ====================

// @desc    Get all active deals
// @route   GET /api/deals
// @access  Public
const getDeals = asyncHandler(async (req, res, next) => {
  // Filter for active and current deals only
  const filter = {
    status: 'active',
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  };

  // Additional filters
  if (req.query.brand) {
    filter.brand = { $regex: req.query.brand, $options: 'i' };
  }

  if (req.query.isFeatured === 'true') {
    filter.isFeatured = true;
  }

  if (req.query.category) {
    filter.category = req.query.category;
  }

  // Execute query
  const features = new APIFeatures(Deal.find(filter), req.query)
    .sort()
    .limitFields()
    .paginate();

  const [deals, total] = await Promise.all([
    features.query.lean(),
    Deal.countDocuments(filter)
  ]);

  // Add computed fields
  const dealsWithMeta = deals.map(deal => ({
    ...deal,
    discountPercentage: Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100),
    amountSaved: deal.originalPrice - deal.dealPrice,
    timeRemaining: getTimeRemaining(deal.endDate)
  }));

  res.status(200).json({
    success: true,
    results: deals.length,
    total,
    pagination: features.pagination,
    data: dealsWithMeta
  });
});

// ==================== ADMIN: GET ALL DEALS ====================

// @desc    Get all deals (Admin)
// @route   GET /api/deals/admin/all
// @access  Private/Admin
const getAllDeals = asyncHandler(async (req, res, next) => {
  const filter = {};

  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === 'true';
  }

  const features = new APIFeatures(Deal.find(filter), req.query)
    .sort()
    .paginate();

  const [deals, total] = await Promise.all([
    features.query.populate('productId', 'name slug price').lean(),
    Deal.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    results: deals.length,
    total,
    pagination: features.pagination,
    data: deals
  });
});

// ==================== READ SINGLE ====================

// @desc    Get deal by ID
// @route   GET /api/deals/:id
// @access  Public
const getDealById = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id)
    .populate('productId', 'name slug price images description')
    .populate('category', 'name slug')
    .lean();

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  // Add computed fields
  deal.discountPercentage = Math.round(((deal.originalPrice - deal.dealPrice) / deal.originalPrice) * 100);
  deal.amountSaved = deal.originalPrice - deal.dealPrice;
  deal.timeRemaining = getTimeRemaining(deal.endDate);
  deal.isCurrentlyActive = new Date() >= deal.startDate && new Date() <= deal.endDate;

  // Track view
  await Deal.findByIdAndUpdate(req.params.id, {
    $inc: { 'metrics.views': 1 }
  });

  res.status(200).json({
    success: true,
    data: deal
  });
});

// @desc    Get deal by slug
// @route   GET /api/deals/slug/:slug
// @access  Public
const getDealBySlug = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findOne({ slug: req.params.slug })
    .populate('productId', 'name slug price images')
    .lean();

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  res.status(200).json({
    success: true,
    data: deal
  });
});

// ==================== UPDATE ====================

// @desc    Update deal
// @route   PUT /api/deals/:id
// @access  Private/Admin
const updateDeal = asyncHandler(async (req, res, next) => {
  let deal = await Deal.findById(req.params.id);

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  const {
    title, description, brand, originalPrice, dealPrice,
    discountType, startDate, endDate, productId, category,
    tags, couponCode, usageLimit, priority, isFeatured,
    targetAudience, platforms, status
  } = req.body;

  // Update image if new file uploaded
  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'deals',
        width: 800,
        height: 500,
        crop: 'fill'
      });
      deal.image = result.secure_url;
      await deleteFile(req.file.path);
    } catch (error) {
      throw new AppError('Image upload failed', 500);
    }
  }

  // Update fields
  if (title) deal.title = title;
  if (description !== undefined) deal.description = description;
  if (brand) deal.brand = brand;
  if (originalPrice) deal.originalPrice = Number(originalPrice);
  if (dealPrice) deal.dealPrice = Number(dealPrice);
  if (discountType) deal.discountType = discountType;
  if (startDate) deal.startDate = new Date(startDate);
  if (endDate) deal.endDate = new Date(endDate);
  if (productId) deal.productId = productId;
  if (category) deal.category = category;
  if (tags) deal.tags = Array.isArray(tags) ? tags : [];
  if (couponCode) deal.couponCode = couponCode.toUpperCase();
  if (usageLimit) deal.usageLimit = usageLimit;
  if (priority !== undefined) deal.priority = Number(priority);
  if (isFeatured !== undefined) deal.isFeatured = isFeatured;
  if (targetAudience) deal.targetAudience = targetAudience;
  if (platforms) deal.platforms = platforms;
  if (status) deal.status = status;

  deal.updatedBy = req.user._id;
  await deal.save();

  res.status(200).json({
    success: true,
    message: 'Deal updated successfully',
    data: deal
  });
});

// ==================== DELETE ====================

// @desc    Delete deal
// @route   DELETE /api/deals/:id
// @access  Private/Admin
const deleteDeal = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  await Deal.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Deal deleted successfully'
  });
});

// @desc    Bulk delete deals
// @route   DELETE /api/deals/bulk
// @access  Private/Admin
const bulkDeleteDeals = asyncHandler(async (req, res, next) => {
  const { dealIds } = req.body;

  if (!dealIds || !Array.isArray(dealIds) || dealIds.length === 0) {
    throw new AppError('Please provide an array of deal IDs', 400);
  }

  const result = await Deal.deleteMany({ _id: { $in: dealIds } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} deals deleted successfully`
  });
});

// ==================== STATUS MANAGEMENT ====================

// @desc    Toggle deal status
// @route   PATCH /api/deals/:id/toggle
// @access  Private/Admin
const toggleDealStatus = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  deal.isActive = !deal.isActive;
  deal.updatedBy = req.user._id;
  await deal.save();

  res.status(200).json({
    success: true,
    message: `Deal ${deal.isActive ? 'activated' : 'deactivated'} successfully`,
    data: deal
  });
});

// @desc    Pause deal
// @route   PATCH /api/deals/:id/pause
// @access  Private/Admin
const pauseDeal = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  if (deal.status !== 'active') {
    throw new AppError('Only active deals can be paused', 400);
  }

  deal.status = 'paused';
  deal.updatedBy = req.user._id;
  await deal.save();

  res.status(200).json({
    success: true,
    message: 'Deal paused successfully',
    data: deal
  });
});

// @desc    Activate deal
// @route   PATCH /api/deals/:id/activate
// @access  Private/Admin
const activateDeal = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findById(req.params.id);

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  if (deal.endDate < new Date()) {
    throw new AppError('Cannot activate an expired deal', 400);
  }

  deal.status = 'active';
  deal.updatedBy = req.user._id;
  await deal.save();

  res.status(200).json({
    success: true,
    message: 'Deal activated successfully',
    data: deal
  });
});

// ==================== SPECIAL ====================

// @desc    Get featured deals
// @route   GET /api/deals/featured
// @access  Public
const getFeaturedDeals = asyncHandler(async (req, res, next) => {
  const limit = Math.min(parseInt(req.query.limit) || 6, 20);

  const deals = await Deal.find({
    isFeatured: true,
    status: 'active',
    isActive: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  })
    .sort({ priority: -1 })
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    count: deals.length,
    data: deals
  });
});

// @desc    Get deal statistics
// @route   GET /api/deals/stats
// @access  Private/Admin
const getDealStats = asyncHandler(async (req, res, next) => {
  const stats = await Deal.aggregate([
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalDeals: { $sum: 1 },
              activeDeals: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$status', 'active'] },
                        { $eq: ['$isActive', true] },
                        { $lte: ['$startDate', new Date()] },
                        { $gte: ['$endDate', new Date()] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              },
              totalViews: { $sum: '$metrics.views' },
              totalClicks: { $sum: '$metrics.clicks' },
              totalConversions: { $sum: '$metrics.conversions' },
              totalRevenue: { $sum: '$metrics.revenue' }
            }
          }
        ],
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ],
        byBrand: [
          {
            $group: {
              _id: '$brand',
              count: { $sum: 1 },
              totalConversions: { $sum: '$metrics.conversions' }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0]
  });
});

// @desc    Track deal click
// @route   POST /api/deals/:id/track-click
// @access  Public
const trackDealClick = asyncHandler(async (req, res, next) => {
  const deal = await Deal.findByIdAndUpdate(
    req.params.id,
    { $inc: { 'metrics.clicks': 1 } },
    { new: false }
  );

  if (!deal) {
    throw new AppError('Deal not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Click tracked'
  });
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Calculate time remaining for a deal
 */
const getTimeRemaining = (endDate) => {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end - now;

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};

export {
  createDeal,
  getDeals,
  getAllDeals,
  getDealById,
  getDealBySlug,
  updateDeal,
  deleteDeal,
  bulkDeleteDeals,
  toggleDealStatus,
  pauseDeal,
  activateDeal,
  getFeaturedDeals,
  getDealStats,
  trackDealClick
};