import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';

/**
 * ============================================
 * COUPON CONTROLLER - Coupon Management
 * ============================================
 */

// ==================== CREATE ====================

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private/Admin
const createCoupon = asyncHandler(async (req, res, next) => {
  const {
    code, description, type, value, minPurchase, maxDiscount,
    maxUsage, startDate, endDate, applicableProducts, userEligibility,
    firstOrderOnly, isCombinable, showOnStore, isFeatured, badge
  } = req.body;

  // Validate required fields
  if (!code || !type || !value || !startDate || !endDate) {
    throw new AppError('Please provide code, type, value, startDate and endDate', 400);
  }

  // Validate coupon code format
  const codeRegex = /^[A-Z0-9_-]{3,20}$/;
  if (!codeRegex.test(code.toUpperCase())) {
    throw new AppError('Coupon code must be 3-20 characters (letters, numbers, underscore, hyphen)', 400);
  }

  // Check unique code
  const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (existingCoupon) {
    throw new AppError('Coupon code already exists', 400);
  }

  // Validate type and value
  const validTypes = ['percentage', 'fixed', 'free_shipping', 'bogo'];
  if (!validTypes.includes(type)) {
    throw new AppError(`Invalid coupon type. Must be one of: ${validTypes.join(', ')}`, 400);
  }

  if (type === 'percentage' && (value < 1 || value > 100)) {
    throw new AppError('Percentage discount must be between 1 and 100', 400);
  }

  // Validate dates
  if (new Date(startDate) < new Date()) {
    throw new AppError('Start date must be in the future', 400);
  }

  if (new Date(endDate) <= new Date(startDate)) {
    throw new AppError('End date must be after start date', 400);
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    description,
    type,
    value: Number(value),
    minPurchase: minPurchase || 0,
    maxDiscount: maxDiscount || null,
    maxUsage: {
      total: maxUsage?.total || null,
      perUser: maxUsage?.perUser || 1
    },
    startDate,
    endDate,
    applicableProducts: applicableProducts || { type: 'all' },
    userEligibility: userEligibility || { type: 'all' },
    firstOrderOnly: firstOrderOnly || false,
    isCombinable: isCombinable || false,
    showOnStore: showOnStore || false,
    isFeatured: isFeatured || false,
    badge: badge || null,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon
  });
});

// ==================== READ ====================

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
// @access  Private/Admin
const getAllCoupons = asyncHandler(async (req, res, next) => {
  const filter = {};

  if (req.query.type) filter.type = req.query.type;
  if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
  if (req.query.search) {
    filter.code = { $regex: req.query.search.toUpperCase(), $options: 'i' };
  }

  const features = new APIFeatures(Coupon.find(filter), req.query)
    .sort()
    .paginate();

  const [coupons, total] = await Promise.all([
    features.query.lean(),
    Coupon.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    results: coupons.length,
    total,
    pagination: features.pagination,
    data: coupons
  });
});

// @desc    Get available coupons (Public - for store display)
// @route   GET /api/coupons/available
// @access  Public
const getAvailableCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find({
    isActive: true,
    showOnStore: true,
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  })
    .select('code description type value discountString minPurchase badge isFeatured')
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(10)
    .lean();

  // Filter out exhausted coupons
  const availableCoupons = coupons.filter(coupon => {
    if (coupon.maxUsage?.total && coupon.maxUsage?.used >= coupon.maxUsage.total) {
      return false;
    }
    return true;
  });

  res.status(200).json({
    success: true,
    count: availableCoupons.length,
    data: availableCoupons
  });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
const getCouponById = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('applicableProducts.products', 'name slug')
    .populate('applicableProducts.categories', 'name slug')
    .lean();

  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  res.status(200).json({
    success: true,
    data: coupon
  });
});

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Public/Private
const validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, orderAmount, productIds } = req.body;

  if (!code) {
    throw new AppError('Please provide a coupon code', 400);
  }

  const { coupon, discount } = await Coupon.validateCoupon(
    code,
    req.user?._id,
    orderAmount || 0,
    productIds || []
  );

  // Check user eligibility
  if (req.user) {
    const isValid = await coupon.isValidForUser(req.user._id);
    if (!isValid) {
      throw new AppError('You are not eligible for this coupon', 400);
    }
  }

  res.status(200).json({
    success: true,
    data: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
      discountString: coupon.discountString,
      discount,
      minPurchase: coupon.minPurchase,
      isValid: true
    }
  });
});

// ==================== UPDATE ====================

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  const allowedFields = [
    'description', 'type', 'value', 'minPurchase', 'maxDiscount',
    'maxUsage', 'startDate', 'endDate', 'applicableProducts',
    'userEligibility', 'firstOrderOnly', 'isCombinable',
    'showOnStore', 'isFeatured', 'badge', 'isActive'
  ];

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      coupon[field] = req.body[field];
    }
  });

  // If code is being changed
  if (req.body.code && req.body.code !== coupon.code) {
    const codeRegex = /^[A-Z0-9_-]{3,20}$/;
    if (!codeRegex.test(req.body.code.toUpperCase())) {
      throw new AppError('Invalid coupon code format', 400);
    }
    
    const existingCoupon = await Coupon.findOne({ 
      code: req.body.code.toUpperCase(),
      _id: { $ne: coupon._id }
    });
    
    if (existingCoupon) {
      throw new AppError('Coupon code already exists', 400);
    }
    
    coupon.code = req.body.code.toUpperCase().trim();
  }

  await coupon.save();

  res.status(200).json({
    success: true,
    message: 'Coupon updated successfully',
    data: coupon
  });
});

// ==================== DELETE ====================

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    throw new AppError('Coupon not found', 404);
  }

  // Soft delete
  coupon.isActive = false;
  await coupon.save();

  res.status(200).json({
    success: true,
    message: 'Coupon deleted successfully'
  });
});

// @desc    Get coupon statistics
// @route   GET /api/coupons/stats
// @access  Private/Admin
const getCouponStats = asyncHandler(async (req, res, next) => {
  const stats = await Coupon.aggregate([
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalCoupons: { $sum: 1 },
              activeCoupons: {
                $sum: {
                  $cond: [
                    {
                      $and: [
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
              totalUsed: { $sum: '$maxUsage.used' }
            }
          }
        ],
        byType: [
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              totalUsed: { $sum: '$maxUsage.used' }
            }
          }
        ],
        mostUsed: [
          { $sort: { 'maxUsage.used': -1 } },
          { $limit: 5 },
          {
            $project: {
              code: 1,
              type: 1,
              value: 1,
              used: '$maxUsage.used'
            }
          }
        ]
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0]
  });
});

export {
  createCoupon,
  getAllCoupons,
  getAvailableCoupons,
  getCouponById,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
  getCouponStats
};