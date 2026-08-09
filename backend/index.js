import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';

// ============================================
// IMPORT ALL MODELS (Ensure they're registered)
// ============================================
import './models/User.js';
import './models/Product.js';
import './models/Category.js';
import './models/SubCategory.js';
import './models/Order.js';
import './models/Review.js';
import './models/Cart.js';
import './models/Wishlist.js';
import './models/Coupon.js';
import './models/Payment.js';
import './models/Deal.js';

// Alternative: Import from models index
// import './models/index.js';

// ============================================
// IMPORT MIDDLEWARE
// ============================================
import { protect, authorize } from './middleware/auth.js';
import errorHandler from './middleware/errorMiddleware.js';

// ============================================
// IMPORT ALL ROUTES
// ============================================
import routes from './routes/index.js'; // Main routes index
// OR import individually:
// import authRoutes from './routes/authRoutes.js';
// import userRoutes from './routes/userRoutes.js';
// import productRoutes from './routes/productRoutes.js';
// import categoryRoutes from './routes/categoryRoutes.js';
// import subCategoryRoutes from './routes/subCategoryRoutes.js';
// import orderRoutes from './routes/orderRoutes.js';
// import reviewRoutes from './routes/reviewRoutes.js';
// import cartRoutes from './routes/cartRoutes.js';
// import wishlistRoutes from './routes/wishlistRoutes.js';
// import couponRoutes from './routes/couponRoutes.js';
// import paymentRoutes from './routes/paymentRoutes.js';
// import dealRoutes from './routes/dealRoutes.js';
// import dashboardRoutes from './routes/dashboardRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://10.75.232.49:5173',
  'https://khethomorr.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(new Error('CORS not allowed'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
  })
);

// ============================================
// BODY PARSER & SECURITY
// ============================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// STATIC FILES
// ============================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// ============================================
// REQUEST LOGGER (Development)
// ============================================
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(
        `📝 ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
      );
    });
    next();
  });
}

// ============================================
// RATE LIMITING (Basic - Production me express-rate-limit use karo)
// ============================================
const requestCounts = new Map();
app.use((req, res, next) => {
  // Skip static files
  if (req.url.startsWith('/uploads') || req.url.startsWith('/public')) {
    return next();
  }

  const key = req.ip + req.url;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 100; // 100 requests per minute

  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
  } else {
    const record = requestCounts.get(key);
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
      });
    } else {
      record.count++;
    }
  }
  next();
});

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 5 * 60 * 1000);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🛒 E-Commerce API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ============================================
// API ROUTES - Using Main Routes Index
// ============================================
app.use('/api', routes);

// OR mount individually (if not using routes/index.js):
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/categories', categoryRoutes);
// app.use('/api/subcategories', subCategoryRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/wishlist', wishlistRoutes);
// app.use('/api/coupons', couponRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/deals', dealRoutes);
// app.use('/api/dashboard', dashboardRoutes);

// ============================================
// QUICK ACCESS ROUTES
// ============================================

// Dashboard quick route
app.get('/api/dashboard', protect, authorize('admin', 'superadmin'), (req, res) => {
  res.json({
    success: true,
    message: `Welcome to dashboard, ${req.user.name}!`,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Admin quick stats
app.get('/api/admin/stats', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const [userCount, productCount, orderCount, reviewCount] = await Promise.all([
      mongoose.model('User').countDocuments(),
      mongoose.model('Product').countDocuments(),
      mongoose.model('Order').countDocuments(),
      mongoose.model('Review').countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        reviews: reviewCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
    });
  }
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.originalUrl}' not found`,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================
const PORT = process.env.PORT || 5000;

// Function to list all registered routes
const listRoutes = () => {
  const routes = [];

  const extractRoutes = (stack, basePath = '') => {
    stack.forEach((layer) => {
      if (layer.route) {
        // Direct route
        const methods = Object.keys(layer.route.methods)
          .join(', ')
          .toUpperCase();
        routes.push({
          method: methods,
          path: basePath + layer.route.path,
        });
      } else if (layer.name === 'router' && layer.handle?.stack) {
        // Router middleware
        let routerPath = basePath;
        if (layer.regexp) {
          const match = layer.regexp
            .toString()
            .replace('/^', '')
            .replace('\\/?(?=\\/|$)/i', '')
            .replace('(?=\\/|$)', '')
            .replace(/\\\//g, '/')
            .replace(/\/\//g, '/');
          routerPath = basePath + '/' + match.replace(/^\/|\/$/g, '');
        }
        extractRoutes(layer.handle.stack, routerPath);
      }
    });
  };

  if (app._router?.stack) {
    extractRoutes(app._router.stack);
  }

  return routes;
};

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ MongoDB Connected Successfully');

    // List registered models
    const modelNames = mongoose.modelNames();
    console.log(`📦 Registered Models (${modelNames.length}): ${modelNames.join(', ')}`);

    // Start listening
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔══════════════════════════════════════════════╗
║  🚀 SERVER STARTED SUCCESSFULLY              ║
╠══════════════════════════════════════════════╣
║  📍 Port: ${PORT}                              ║
║  🌍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(26)} ║
║  📦 Models: ${String(modelNames.length).padEnd(31)} ║
║  🛣️  API Base: http://localhost:${PORT}/api      ║
║  ❤️  Health: http://localhost:${PORT}/api/health ║
╚══════════════════════════════════════════════╝
      `);

      // List all routes in development
      if (process.env.NODE_ENV === 'development') {
        console.log('\n📋 Registered API Routes:');
        const routes = listRoutes();
        const apiRoutes = routes.filter((r) => r.path.includes('/api/'));
        
        if (apiRoutes.length > 0) {
          console.table(apiRoutes.slice(0, 50)); // Show first 50
          if (apiRoutes.length > 50) {
            console.log(`... and ${apiRoutes.length - 50} more routes`);
          }
        }
        console.log(`\n📊 Total Routes: ${routes.length}`);
      }
    });

    // Graceful shutdown
    const gracefulShutdown = (signal) => {
      console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed');
        mongoose.connection.close(false).then(() => {
          console.log('✅ MongoDB connection closed');
          process.exit(0);
        });
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle unhandled errors
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      if (process.env.NODE_ENV === 'production') {
        // Don't crash in production, just log
        console.error('Continuing despite unhandled rejection...');
      } else {
        server.close(() => process.exit(1));
      }
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      server.close(() => process.exit(1));
    });

    return server;
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

// Start the server
const server = await startServer();

export default app;