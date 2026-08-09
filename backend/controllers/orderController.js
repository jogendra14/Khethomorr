import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js'; // ← ADD THIS
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import APIFeatures from '../utils/APIFeatures.js';
import sendEmail from '../utils/sendEmail.js';

/**
 * ============================================
 * ORDER CONTROLLER - Complete Order Management
 * ============================================
 */

// ==================== CREATE ORDER ====================

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res, next) => {
  const {
    items,
    address,
    paymentMethod = 'COD',
    couponCode,
    notes,
    isGift,
    giftMessage
  } = req.body;

  // Validate items
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new AppError('Please provide order items', 400);
  }

  // Validate address
  if (!address || !address.fullName || !address.street || !address.city || 
      !address.postalCode || !address.country || !address.phone) {
    throw new AppError('Please provide complete delivery address with phone number', 400);
  }

  // Validate payment method
  const validPaymentMethods = ['COD', 'Online', 'UPI', 'Card', 'NetBanking', 'Wallet'];
  if (!validPaymentMethods.includes(paymentMethod)) {
    throw new AppError(`Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`, 400);
  }

  // COD limit check
  if (paymentMethod === 'COD') {
    const tempTotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    if (tempTotal > 50000) {
      throw new AppError('COD is not available for orders above ₹50,000', 400);
    }
  }

  // Fetch products and validate stock
  const productIds = items.map(item => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  if (products.length !== new Set(productIds).size) {
    throw new AppError('One or more products not found', 404);
  }

  // Build order items with validation
  const orderItems = [];
  let subtotal = 0;
  const stockUpdates = [];

  for (const item of items) {
    const product = products.find(p => p._id.toString() === item.productId.toString());
    
    if (!product) {
      throw new AppError(`Product not found: ${item.productId}`, 404);
    }

    if (product.status !== 'active') {
      throw new AppError(`${product.name} is currently unavailable`, 400);
    }

    const qty = parseInt(item.qty);
    if (qty < 1 || qty > (product.maxOrderQuantity || 10)) {
      throw new AppError(`Invalid quantity for ${product.name}. Min: 1, Max: ${product.maxOrderQuantity || 10}`, 400);
    }

    if (product.quantity < qty) {
      throw new AppError(`Insufficient stock for ${product.name}. Available: ${product.quantity}`, 400);
    }

    // Check variant if specified
    let variant = null;
    if (item.variantId) {
      const foundVariant = product.variants.id(item.variantId);
      if (!foundVariant) {
        throw new AppError(`Variant not found for ${product.name}`, 404);
      }
      if (foundVariant.quantity < qty) {
        throw new AppError(`Insufficient stock for ${product.name} - ${foundVariant.name}`, 400);
      }
      variant = {
        name: `${foundVariant.name}: ${foundVariant.value}`,
        sku: foundVariant.sku
      };
    }

    // Use current price (considering discounts)
    const price = product.currentPrice || product.price;

    orderItems.push({
      productId: product._id,
      name: product.name,
      qty,
      price,
      image: product.images[0]?.url || '',
      variant,
      subtotal: price * qty
    });

    subtotal += price * qty;

    // Prepare stock updates
    stockUpdates.push({
      productId: product._id,
      qty: -qty,
      variantId: item.variantId || null
    });
  }

  // Calculate order totals
  const tax = subtotal * 0.18; // 18% GST
  const shippingCost = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
  const discount = 0; // Will be calculated if coupon applied
  const totalAmount = subtotal + tax + shippingCost - discount;

  // Create order
  const order = await Order.create({
    userId: req.user._id,
    items: orderItems,
    subtotal,
    tax,
    shippingCost,
    discount,
    totalAmount,
    address: {
      fullName: address.fullName.trim(),
      phone: address.phone.trim(),
      street: address.street.trim(),
      apartment: address.apartment?.trim(),
      city: address.city.trim(),
      state: address.state?.trim(),
      postalCode: address.postalCode.trim(),
      country: address.country.trim()
    },
    paymentMethod,
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
    couponCode,
    notes: notes?.trim(),
    isGift: isGift || false,
    giftMessage: giftMessage?.trim(),
    status: paymentMethod === 'COD' ? 'Pending' : 'Pending',
    statusHistory: [{
      status: 'Pending',
      timestamp: new Date()
    }],
    estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  // Update product stock
  await Promise.all(
    stockUpdates.map(async (update) => {
      if (update.variantId) {
        await Product.updateOne(
          { _id: update.productId, 'variants._id': update.variantId },
          { $inc: { 'variants.$.quantity': update.qty } }
        );
      }
      await Product.findByIdAndUpdate(update.productId, {
        $inc: {
          quantity: update.qty,
          totalSold: Math.abs(update.qty)
        }
      });
    })
  );

  // Clear user's cart
  if (req.user._id) {
    await Cart.findOneAndUpdate(
      { userId: req.user._id, status: 'active' },
      { status: 'converted' }
    );
  }

  // Create payment record
  await Payment.create({
    orderId: order._id,
    userId: req.user._id,
    amount: totalAmount,
    paymentMethod,
    status: 'initiated'
  });

  // Send order confirmation email
  try {
    await sendEmail({
      email: req.user.email,
      subject: `Order Confirmed - #${order.orderNumber}`,
      html: generateOrderEmail(order, req.user.name)
    });
  } catch (error) {
    console.log('Order confirmation email failed:', error.message);
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: order
  });
});

// ==================== READ ORDERS ====================

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res, next) => {
  const filter = { userId: req.user._id };

  // Status filter
  if (req.query.status) {
    filter.status = req.query.status;
  }

  const features = new APIFeatures(
    Order.find(filter)
      .populate('items.productId', 'name images price slug')
      .select('-__v'),
    req.query
  )
    .sort()
    .paginate();

  const [orders, total] = await Promise.all([
    features.query.lean(),
    Order.countDocuments(filter)
  ]);

  res.status(200).json({
    success: true,
    results: orders.length,
    total,
    pagination: features.pagination,
    data: orders
  });
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res, next) => {
  const filter = {};

  // Status filter
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Payment status filter
  if (req.query.paymentStatus) {
    filter.paymentStatus = req.query.paymentStatus;
  }

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate);
  }

  // User filter
  if (req.query.userId) {
    filter.userId = req.query.userId;
  }

  // Search by order number
  if (req.query.search) {
    filter.orderNumber = { $regex: req.query.search, $options: 'i' };
  }

  const features = new APIFeatures(
    Order.find(filter)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name images price'),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const [orders, total] = await Promise.all([
    features.query.lean(),
    Order.countDocuments(filter)
  ]);

  // Get order statistics
  const stats = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    results: orders.length,
    total,
    pagination: features.pagination,
    stats: stats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 },
    data: orders
  });
});

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('userId', 'name email phone')
    .populate('items.productId', 'name images price description')
    .populate('updatedBy', 'name email')
    .lean();

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check if user is authorized to view this order
  if (
    req.user.role !== 'admin' &&
    order.userId._id.toString() !== req.user._id.toString()
  ) {
    throw new AppError('Not authorized to view this order', 403);
  }

  // Get payment info
  const payment = await Payment.findOne({ orderId: order._id })
    .select('-__v')
    .lean();

  res.status(200).json({
    success: true,
    data: {
      ...order,
      payment
    }
  });
});

// ==================== UPDATE ORDER STATUS ====================

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;

  const validStatuses = [
    'Pending', 'Confirmed', 'Processing', 'Shipped',
    'In Transit', 'Out for Delivery', 'Delivered',
    'Cancelled', 'Returned', 'Refunded'
  ];

  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Validate status transition
  const validTransitions = {
    'Pending': ['Confirmed', 'Cancelled'],
    'Confirmed': ['Processing', 'Cancelled'],
    'Processing': ['Shipped', 'Cancelled'],
    'Shipped': ['In Transit', 'Out for Delivery', 'Delivered'],
    'In Transit': ['Out for Delivery', 'Delivered'],
    'Out for Delivery': ['Delivered'],
    'Delivered': ['Returned'],
    'Returned': ['Refunded']
  };

  if (validTransitions[order.status] && !validTransitions[order.status].includes(status)) {
    throw new AppError(
      `Cannot change status from "${order.status}" to "${status}"`,
      400
    );
  }

  // Check if order can be cancelled
  if (status === 'Cancelled' && !order.canCancel) {
    throw new AppError('This order cannot be cancelled', 400);
  }

  const previousStatus = order.status;
  order.status = status;
  order.updatedBy = req.user._id;

  // Add to status history
  order.statusHistory.push({
    status,
    timestamp: new Date(),
    note: note || `Status changed from ${previousStatus} to ${status}`,
    updatedBy: req.user._id
  });

  // Set relevant timestamps
  if (status === 'Shipped') order.shippedAt = new Date();
  if (status === 'Delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = 'Paid';
  }
  if (status === 'Cancelled') order.cancelledAt = new Date();

  await order.save();

  // Send status update email
  try {
    const user = await User.findById(order.userId);
    if (user) {
      await sendEmail({
        email: user.email,
        subject: `Order ${order.orderNumber} - ${status}`,
        message: `Your order #${order.orderNumber} has been ${status.toLowerCase()}.\n\n${note ? `Note: ${note}` : ''}`
      });
    }
  } catch (error) {
    console.log('Status update email failed:', error.message);
  }

  res.status(200).json({
    success: true,
    message: `Order status updated to ${status}`,
    data: order
  });
});

// @desc    Cancel order (User)
// @route   PATCH /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason || reason.trim().length < 10) {
    throw new AppError('Please provide a reason for cancellation (min 10 characters)', 400);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Check ownership
  if (order.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  await order.cancel(reason, req.user._id);

  // Restore product stock
  await Promise.all(
    order.items.map(item =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: item.qty, totalSold: -item.qty }
      })
    )
  );

  // Process refund if payment was made
  if (order.paymentStatus === 'Paid') {
    const payment = await Payment.findOne({ orderId: order._id });
    if (payment) {
      await payment.processRefund(order.totalAmount, reason);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// ==================== SHIPPING ====================

// @desc    Add tracking information
// @route   PATCH /api/orders/:id/tracking
// @access  Private/Admin
const addTrackingInfo = asyncHandler(async (req, res, next) => {
  const { trackingNumber, carrier } = req.body;

  if (!trackingNumber || !carrier) {
    throw new AppError('Please provide tracking number and carrier', 400);
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  await order.addTracking(trackingNumber, carrier);

  // Send notification
  try {
    const user = await User.findById(order.userId);
    if (user) {
      await sendEmail({
        email: user.email,
        subject: `Tracking Update - Order #${order.orderNumber}`,
        message: `Your order has been shipped!\n\nTracking Number: ${trackingNumber}\nCarrier: ${carrier}`
      });
    }
  } catch (error) {
    console.log('Tracking email failed:', error.message);
  }

  res.status(200).json({
    success: true,
    message: 'Tracking information added',
    data: order
  });
});

// ==================== PAYMENT ====================

// @desc    Update payment status
// @route   PATCH /api/orders/:id/payment
// @access  Private/Admin
const updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const { paymentStatus, transactionId } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  await order.updatePayment(paymentStatus, { transactionId });

  // Update payment record
  await Payment.findOneAndUpdate(
    { orderId: order._id },
    {
      status: paymentStatus === 'Paid' ? 'completed' : paymentStatus.toLowerCase(),
      gatewayTransactionId: transactionId,
      completedAt: paymentStatus === 'Paid' ? new Date() : null
    }
  );

  res.status(200).json({
    success: true,
    message: 'Payment status updated',
    data: order
  });
});

// ==================== DELETE ====================

// @desc    Delete order (Admin only)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Only allow deletion of cancelled orders
  if (order.status !== 'Cancelled') {
    throw new AppError('Only cancelled orders can be deleted', 400);
  }

  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Order deleted successfully'
  });
});

// ==================== STATISTICS ====================

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private/Admin
const getOrderStats = asyncHandler(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

  const stats = await Order.aggregate([
    {
      $facet: {
        overview: [
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalRevenue: { $sum: '$totalAmount' },
              averageOrderValue: { $avg: '$totalAmount' },
              totalItemsSold: { $sum: { $sum: '$items.qty' } }
            }
          }
        ],
        todayStats: [
          { $match: { createdAt: { $gte: today } } },
          {
            $group: {
              _id: null,
              orders: { $sum: 1 },
              revenue: { $sum: '$totalAmount' }
            }
          }
        ],
        monthlyTrend: [
          {
            $match: {
              createdAt: { $gte: new Date(today.getFullYear(), today.getMonth() - 6, 1) }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              orders: { $sum: 1 },
              revenue: { $sum: '$totalAmount' }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ],
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              revenue: { $sum: '$totalAmount' }
            }
          }
        ],
        byPaymentMethod: [
          {
            $group: {
              _id: '$paymentMethod',
              count: { $sum: 1 },
              revenue: { $sum: '$totalAmount' }
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

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate HTML email for order confirmation
 */
const generateOrderEmail = (order, userName) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover;">
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.name}
        ${item.variant ? `<br><small style="color: #666;">${item.variant.name}</small>` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.qty}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.subtotal}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0;">Order Confirmed!</h1>
        <p style="margin: 10px 0 0;">Order #${order.orderNumber}</p>
      </div>

      <div style="padding: 20px;">
        <p>Hello ${userName},</p>
        <p>Thank you for your order! We're getting it ready.</p>

        <h3 style="color: #333;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Name</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
              <th style="padding: 10px; text-align: right;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
          <p><strong>Tax:</strong> ₹${order.tax}</p>
          <p><strong>Shipping:</strong> ${order.shippingCost === 0 ? 'FREE' : '₹' + order.shippingCost}</p>
          ${order.discount > 0 ? `<p><strong>Discount:</strong> -₹${order.discount}</p>` : ''}
          <hr>
          <p style="font-size: 18px; color: #4CAF50;"><strong>Total: ₹${order.totalAmount}</strong></p>
        </div>

        <div style="margin-top: 30px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
          <h4 style="margin-top: 0;">Delivery Address</h4>
          <p style="margin: 5px 0;">${order.address.fullName}</p>
          <p style="margin: 5px 0;">${order.address.street}</p>
          ${order.address.apartment ? `<p style="margin: 5px 0;">${order.address.apartment}</p>` : ''}
          <p style="margin: 5px 0;">${order.address.city}, ${order.address.state} - ${order.address.postalCode}</p>
          <p style="margin: 5px 0;">${order.address.country}</p>
          <p style="margin: 5px 0;">📞 ${order.address.phone}</p>
        </div>

        <div style="margin-top: 20px; padding: 15px; background-color: #FFF3E0; border-radius: 5px;">
          <p style="margin: 0; color: #E65100;">
            <strong>Estimated Delivery:</strong> ${new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          You can track your order status by logging into your account.
          If you have any questions, please contact our support team.
        </p>
      </div>
    </div>
  `;
};

export {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  addTrackingInfo,
  updatePaymentStatus,
  deleteOrder,
  getOrderStats
};