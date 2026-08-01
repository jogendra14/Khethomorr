//backend/index.js

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import dealsRoutes from "./routes/dealsRoutes.js";
import ordersRoutes from "./routes/ordersRoutes.js";
import paymentsRoutes from "./routes/paymentsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
//import categoryRoutes from "./routes/categoryRoutes.js";     
//import subCategoryRoutes from "./routes/subCategoryRoutes.js";


const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://10.189.116.49:5173",
  "https://khethomorr.vercel.app",
  "https://khethomorr-r45zbcs1t-jogndra.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("E-commerce backend is working properly..!");
});

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
//app.use("/api/categories", categoryRoutes);           
//app.use("/api/subcategories", subCategoryRoutes);     
app.use("/api/deals", dealsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/home", homeRoutes);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
