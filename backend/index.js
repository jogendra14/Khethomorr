// backend/index.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js"; // 👈 ADD T
import dealsRoutes from "./routes/dealsRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import siteRoutes from "./routes/siteRoutes.js";

import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

// ✅ Allowed Origins - Environment ke hisaab se
const allowedOrigins = [
  "http://localhost:5173",
  "http://10.176.8.49:5173",
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

// ✅ Routes
app.use("/api/admin", adminRoutes);
console.log("index me reached")
app.use("/api/admin", categoryRoutes); // 👈
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/deals", dealsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/site", siteRoutes);

// ✅ 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ✅ Global Error Handler
app.use(errorHandler);

// ✅ Port
const PORT = process.env.PORT || 5000;

// ✅ Helper function to get all routes
const getRegisteredRoutes = () => {
  const routes = [];
  
  try {
    // Check if _router exists
    if (app._router && app._router.stack) {
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({
            path: middleware.route.path,
            methods: Object.keys(middleware.route.methods).join(", ").toUpperCase(),
          });
        } else if (middleware.name === "router" && middleware.handle && middleware.handle.stack) {
          middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
              routes.push({
                path: handler.route.path,
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

// ✅ Start Server with better error handling
const startServer = async () => {
  try {
    await connectDB();
    
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      
      // Show all registered routes
      console.log("\n📋 Registered Routes:");
      const routes = getRegisteredRoutes();
      if (routes.length > 0) {
        console.table(routes);
      } else {
        console.log("  No routes found or unable to list routes");
      }
    });

    // ✅ Graceful Shutdown
    const shutdown = () => {
      console.log("🛑 Shutting down gracefully...");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (error) {
    console.error("❌ Server startup error:", error.message);
    process.exit(1);
  }
};

// ✅ Handle unhandled rejections
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

startServer();
