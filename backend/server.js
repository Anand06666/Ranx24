// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import AppError from "./utils/AppError.js";
import globalErrorHandler from "./middleware/errorMiddleware.js";
import validateEnv from "./config/validateEnv.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { sanitizeMongo, sanitizeXSS, customSanitize } from "./middleware/sanitize.js";
import http from "http";
import { Server } from "socket.io";

// ES Module dirname fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  console.error("Environment validation failed:", error.message);
  process.exit(1);
}

const app = express();

// ---------------------------
// 🚀 PRODUCTION ORIGINS FIXED
// ---------------------------
const FRONTEND = process.env.CLIENT_URL || "http://q8c8swkgsgcws40cw888gcww.72.61.233.226.sslip.io";
const ADMIN = process.env.ADMIN_URL || null;

const allowedOrigins = [
  FRONTEND,
  ADMIN,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://localhost:19006"
].filter(Boolean);

// ---------------------------
// 🚀 GLOBAL CORS
// ---------------------------
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ---------------------------
// 🚀 Helmet Security (CSP Fixed)
// ---------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "*"],
        connectSrc: [
          "'self'",
          "ws:",
          "wss:",
          FRONTEND,
          ADMIN,
          "*",
        ],
      },
    },
  })
);

// ---------------------------
// 🚀 Rate Limiting
// ---------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

// Body Parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Sanitization
app.use(sanitizeMongo);
app.use(sanitizeXSS);
app.use(customSanitize);

// Static Folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------------
// 🚀 ROUTES IMPORT
// ---------------------------
import adminWorkerRoutes from "./router/adminWorkerRoutes.js";
import adminRoutes from "./router/adminRoutes.js";
import categoryRoutes from "./router/categoryRoutes.js";
import workerRoutes from "./router/workerRoutes.js";
import userRoutes from "./router/userRoutes.js";
import bookingRoutes from "./router/bookingRoutes.js";
import cityRoutes from "./router/cityRoutes.js";
import cartRoutes from "./router/cartRoutes.js";
import authRoutes from "./router/authRoutes.js";
import userwalletRoutes from "./router/userwalletRoutes.js";
import paymentRoutes from "./router/paymentRoutes.js";
import supportRoutes from "./router/supportRoutes.js";
import reviewRoutes from "./router/reviewRoutes.js";
import chatRoutes from "./router/chatRoutes.js";
import bannerRoutes from "./router/bannerRoutes.js";
import couponRoutes from "./router/couponRoutes.js";
import coinsRoutes from "./router/coinsRoutes.js";
import addressRoutes from "./router/addressRoutes.js";
import availabilityRoutes from "./router/availabilityRoutes.js";
import notificationRoutes from "./router/notificationRoutes.js";
import workerAnalyticsRoutes from "./router/workerAnalyticsRoutes.js";
import workerSupportRoutes from "./router/workerSupportRoutes.js";
import workerWalletRoutes from "./router/workerWalletRoutes.js";
import serviceRoutes from "./router/serviceRoutes.js";
import locationRoutes from "./router/locationRoutes.js";
import paymentConfigRoutes from "./router/paymentConfigRoutes.js";

// ---------------------------
// 🚀 USE ROUTES
// ---------------------------
app.use("/api/admin", adminRoutes);
app.use("/api/admin/workers", adminWorkerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/workers/analytics", workerAnalyticsRoutes);
app.use("/api/workers/support", workerSupportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/wallet", userwalletRoutes);
app.use("/api/worker-wallet", workerWalletRoutes);
app.use("/api/payment/config", paymentConfigRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/coins", coinsRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/location", locationRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Base Route
app.get("/", (req, res) => {
  res.send("Backend API is running successfully 🚀");
});

// Not Found
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// ---------------------------
// 🚀 DATABASE CONNECT
// ---------------------------
mongoose
  .connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    minPoolSize: 5,
  })
  .then(() => console.log("🟢 MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ---------------------------
// 🚀 SOCKET.IO SETUP
// ---------------------------
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// Middleware for socket access
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket Events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join_room", (userId) => userId && socket.join(userId));
  socket.on("join_notifications", (userId) => userId && socket.join(userId));
  socket.on("join_chat", (chatId) => chatId && socket.join(chatId));
  socket.on("leave_chat", (chatId) => chatId && socket.leave(chatId));

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start Server
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🔥 Server running on port ${PORT}`)
);
