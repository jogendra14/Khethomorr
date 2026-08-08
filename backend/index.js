// backend/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from 'mongoose';  // Add this
import connectDB from "./config/db.js";

// IMPORTANT: Pehle models import karo
import './models/Category.js';
import './models/SubCategory.js';
import './models/Product.js';
import './models/User.js';

// Ya models index se import karo
// import './models/index.js';

// Middleware imports
import { protect, authorize } from './middleware/auth.js';
import { errorHandler } from "./middleware/errorMiddleware.js";
import upload from './middleware/upload.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
//import adminRoutes from "./routes/adminRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dealsRoutes from "./routes/dealsRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
//import siteRoutes from "./routes/siteRoutes.js";

// Controller imports (for direct routes in index.js)
import { createProduct } from './controller/productController.js';

const app = express();

// ✅ Allowed Origins - Environment ke hisaab se
const allowedOrigins = [
  "http://localhost:5173",
  "http://10.75.232.49:5173",
  "https://khethomorr.vercel.app",
  "https://khethomorr-r45zbcs1t-jogndra.vercel.app",
  // ✅ Add production domain if any
  process.env.FRONTEND_URL,
].filter(Boolean); // Remove undefined values

// ✅ CORS Configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked: ${origin}`);
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Body Parser
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ Static Files
app.use("/uploads", express.static("uploads"));

// ✅ Request Logger (Development only)
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// ✅ Health Check
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "E-commerce Khethomorr backend is working properly!",
    timestamp: new Date().toISOString(),
  });
});

// ============================================
// ✅ API Routes
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Public Routes (No authentication required)
app.use("/api/home", homeRoutes);
//app.use("/api/site", siteRoutes);

// Mixed Routes (Some public, some protected - handled inside route files)
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/deals", dealsRoutes);

// Protected Routes (All routes require authentication)
app.use("/api/orders", protect, ordersRoutes);
app.use("/api/payments", protect, paymentsRoutes);

// Admin Only Routes (Require admin role)
app.use("/api/analytics", protect, authorize('admin', 'superadmin'), analyticsRoutes);

// ============================================
// ✅ Additional Direct Routes (if needed)
// ============================================

// Dashboard Route (Protected)
app.get('/api/dashboard', protect, (req, res) => {
  res.json({
    success: true,
    message: `Welcome to dashboard, ${req.user.name}!`,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Admin Users Route (Admin only)
app.get('/api/admin/users', protect, authorize('admin', 'superadmin'), (req, res) => {
  res.json({
    success: true,
    message: 'Admin users list route',
    users: []
  });
});

// Protected Product Creation Example
app.post('/api/products/create-with-auth',
  protect,
  authorize('admin', 'vendor'),
  upload.array('images', 10),
  createProduct
);

// ============================================
// ✅ Error Handling
// ============================================

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use(errorHandler);

// ============================================
// ✅ Server Setup
// ============================================

const PORT = process.env.PORT || 5000;

// Helper function to get all registered routes
const getRegisteredRoutes = () => {
  const routes = [];
  
  try {
    if (app._router && app._router.stack) {
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          // Direct routes
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods).join(", ").toUpperCase(),
          });
        } else if (middleware.name === "router" && middleware.handle && middleware.handle.stack) {
          // Nested router routes
          const basePath = middleware.regexp.source
            .replace('\\/?(?=\\/|$)', '')
            .replace('^\\/', '/')
            .replace('\\/', '/')
            .replace('(?=\\/|$)', '')
            .replace(/\\\//g, '/');
          
          middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
              const fullPath = basePath + handler.route.path;
              routes.push({
                path: fullPath.replace(/\/\//g, '/'), // Remove double slashes
                methods: Object.keys(handler.route.methods).join(", ").toUpperCase(),
              });
            }
          });
        }
      });
    }
  } catch (error) {
    console.warn("⚠️ Could not list routes:", error.message);
  }
  
  return routes;
};

// Start Server with better error handling
const startServer = async () => {
  try {
    await connectDB();
    
    console.log('📋 Registered Models:', mongoose.modelNames());

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 CORS Origins: ${allowedOrigins.join(", ")}`);
      
      // Show all registered routes
      console.log("\n📋 Registered Routes:");
      const routes = getRegisteredRoutes();
      if (routes.length > 0) {
        console.table(routes);
      } else {
        console.log("  No routes found or unable to list routes");
      }
    });

    // Graceful Shutdown
    const shutdown = () => {
      console.log("\n🛑 Shutting down gracefully...");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error("❌ Could not close connections in time, forcefully shutting down");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (error) {
    console.error("❌ Server startup error:", error.message);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  // Don't exit in production, just log
  if (process.env.NODE_ENV === "development") {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

// Start the server
startServer();

export default app;