import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendEmail from '../utils/sendEmail.js'; // ← ADD THIS for shareWishlist


/**
 * ============================================
 * WISHLIST CONTROLLER - Wishlist Management
 * ============================================
 */

// ==================== GET WISHLISTS ====================

// @desc    Get user's wishlists
// @route   GET /api/wishlist
// @access  Private
const getWishlists = asyncHandler(async (req, res, next) => {
  const wishlists = await Wishlist.find({ 
    userId: req.user._id, 
    isActive: true 
  })
    .populate('products.productId', 'name price images quantity status averageRating')
    .sort({ isDefault: -1, updatedAt: -1 })
    .lean();

  // Check product availability
  const updatedWishlists = wishlists.map(wishlist => ({
    ...wishlist,
    products: wishlist.products.map(item => ({
      ...item,
      isAvailable: item.productId?.status === 'active' && item.productId?.quantity > 0,
      currentPrice: item.productId?.currentPrice || item.productId?.price
    }))
  }));

  res.status(200).json({
    success: true,
    count: updatedWishlists.length,
    data: updatedWishlists
  });
});

// @desc    Get default wishlist
// @route   GET /api/wishlist/default
// @access  Private
const getDefaultWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.getDefaultWishlist(req.user._id);
  
  await wishlist.populate('products.productId', 'name price images quantity status averageRating');

  res.status(200).json({
    success: true,
    data: wishlist
  });
});

// ==================== CREATE WISHLIST ====================

// @desc    Create new wishlist
// @route   POST /api/wishlist
// @access  Private
const createWishlist = asyncHandler(async (req, res, next) => {
  const { name, isDefault, notificationSettings } = req.body;

  // Check wishlist limit (max 5 per user)
  const wishlistCount = await Wishlist.countDocuments({ 
    userId: req.user._id, 
    isActive: true 
  });

  if (wishlistCount >= 5) {
    throw new AppError('Maximum 5 wishlists allowed', 400);
  }

  const wishlist = await Wishlist.create({
    userId: req.user._id,
    name: name || 'My Wishlist',
    isDefault: isDefault || false,
    notificationSettings: notificationSettings || {
      priceDrop: true,
      backInStock: true,
      dealStart: false
    }
  });

  res.status(201).json({
    success: true,
    message: 'Wishlist created',
    data: wishlist
  });
});

// ==================== ADD TO WISHLIST ====================

// @desc    Add product to wishlist
// @route   POST /api/wishlist/items
// @access  Private
const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId, wishlistId, note, priority } = req.body;

  // Validate product
  const product = await Product.findById(productId).select('name price images');
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  // Get or create wishlist
  let wishlist;
  if (wishlistId) {
    wishlist = await Wishlist.findOne({ 
      _id: wishlistId, 
      userId: req.user._id 
    });
    if (!wishlist) {
      throw new AppError('Wishlist not found', 404);
    }
  } else {
    wishlist = await Wishlist.getDefaultWishlist(req.user._id);
  }

  // Check if product already exists
  if (wishlist.hasProduct(productId)) {
    throw new AppError('Product already in wishlist', 400);
  }

  // Check wishlist item limit (max 50 items)
  if (wishlist.products.length >= 50) {
    throw new AppError('Maximum 50 items per wishlist', 400);
  }

  // Add product
  await wishlist.addProduct({
    productId: product._id,
    name: product.name,
    price: product.currentPrice || product.price,
    image: product.images[0]?.url || '',
    note: note?.trim(),
    priority: priority || 0
  });

  await wishlist.populate('products.productId', 'name price images quantity status');

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist',
    data: wishlist
  });
});

// ==================== REMOVE FROM WISHLIST ====================

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/items/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { wishlistId } = req.query;

  let wishlist;
  if (wishlistId) {
    wishlist = await Wishlist.findOne({ 
      _id: wishlistId, 
      userId: req.user._id 
    });
  } else {
    wishlist = await Wishlist.getDefaultWishlist(req.user._id);
  }

  if (!wishlist) {
    throw new AppError('Wishlist not found', 404);
  }

  await wishlist.removeProduct(req.params.productId);

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist',
    data: wishlist
  });
});

// ==================== MOVE TO CART ====================

// @desc    Move item from wishlist to cart
// @route   POST /api/wishlist/move-to-cart/:productId
// @access  Private
const moveToCart = asyncHandler(async (req, res, next) => {
  const { wishlistId } = req.body;

  let wishlist;
  if (wishlistId) {
    wishlist = await Wishlist.findOne({ 
      _id: wishlistId, 
      userId: req.user._id 
    });
  } else {
    wishlist = await Wishlist.getDefaultWishlist(req.user._id);
  }

  if (!wishlist) {
    throw new AppError('Wishlist not found', 404);
  }

  // Get or create cart
  let cart = await Cart.findOne({ 
    userId: req.user._id, 
    status: 'active' 
  });
  
  if (!cart) {
    cart = await Cart.create({ userId: req.user._id });
  }

  // Move to cart
  const updatedCart = await wishlist.moveToCart(req.params.productId, cart);

  res.status(200).json({
    success: true,
    message: 'Item moved to cart',
    data: {
      wishlist,
      cart: updatedCart
    }
  });
});

// ==================== UPDATE WISHLIST ====================

// @desc    Update wishlist details
// @route   PUT /api/wishlist/:id
// @access  Private
const updateWishlist = asyncHandler(async (req, res, next) => {
  const { name, isPublic, notificationSettings } = req.body;

  const wishlist = await Wishlist.findOne({ 
    _id: req.params.id, 
    userId: req.user._id 
  });

  if (!wishlist) {
    throw new AppError('Wishlist not found', 404);
  }

  if (name) wishlist.name = name.trim();
  if (isPublic !== undefined) wishlist.isPublic = isPublic;
  if (notificationSettings) {
    wishlist.notificationSettings = {
      ...wishlist.notificationSettings,
      ...notificationSettings
    };
  }

  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Wishlist updated',
    data: wishlist
  });
});

// @desc    Delete wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const deleteWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({ 
    _id: req.params.id, 
    userId: req.user._id 
  });

  if (!wishlist) {
    throw new AppError('Wishlist not found', 404);
  }

  // Don't delete default wishlist, just clear it
  if (wishlist.isDefault) {
    wishlist.products = [];
    await wishlist.save();
    
    return res.status(200).json({
      success: true,
      message: 'Default wishlist cleared',
      data: wishlist
    });
  }

  wishlist.isActive = false;
  await wishlist.save();

  res.status(200).json({
    success: true,
    message: 'Wishlist deleted'
  });
});

// @desc    Share wishlist via email
// @route   POST /api/wishlist/:id/share
// @access  Private
const shareWishlist = asyncHandler(async (req, res, next) => {
  const { email, message } = req.body;

  if (!email) {
    throw new AppError('Please provide recipient email', 400);
  }

  const wishlist = await Wishlist.findOne({ 
    _id: req.params.id, 
    userId: req.user._id 
  });

  if (!wishlist) {
    throw new AppError('Wishlist not found', 404);
  }

  await wishlist.shareWithEmail(email);

  // Send email notification
  try {
    await sendEmail({
      email,
      subject: `${req.user.name} shared a wishlist with you`,
      html: `
        <h2>Wishlist Shared!</h2>
        <p>${req.user.name} has shared their wishlist "${wishlist.name}" with you.</p>
        ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
        <p>View the wishlist here: ${process.env.CLIENT_URL}/wishlist/${wishlist._id}</p>
      `
    });
  } catch (error) {
    console.log('Share email failed:', error.message);
  }

  res.status(200).json({
    success: true,
    message: 'Wishlist shared successfully'
  });
});

export {
  getWishlists,
  getDefaultWishlist,
  createWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  updateWishlist,
  deleteWishlist,
  shareWishlist
};