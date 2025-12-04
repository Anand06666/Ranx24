// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import AppError from "./utils/AppError.js";
import globalErrorHandler from "./middleware/errorMiddleware.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";
import validateEnv from "./config/validateEnv.js";

// Fix dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Load env
dotenv.config();

// Validate env
try {
  validateEnv();
} catch (error) {
  console.error("❌ ENV validation failed:", error.message);
  process.exit(1);
}

// ---------------------------
// 🌍 Correct Production Domains
// ---------------------------
const FRONTEND_URL = process.env.CLIENT_URL || "https://ranx24.com";
const ADMIN_URL = process.env.ADMIN_URL || null;

const allowedOrigins = [
  FRONTEND_URL,
  ADMIN_URL,
  "http://localhost:5173",
  "http://localhost:3000"
].filter(Boolean);

console.log("✅ Allowed Origins:", allowedOrigins);

// ---------------------------
// 🚀 GLOBAL CORS FIX
// ---------------------------
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ Blocked by CORS:", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));

// ---------------------------
// 🔒 Helmet Security
// ---------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "blob:", "*"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'", "*"],
      },
    },
  })
);

// ---------------------------
// 🚫 Rate Limit
// ---------------------------
app.use(
  rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 300,
  })
);

// ---------------------------
// 🧩 Body Parser
// ---------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ---------------------------
// 📁 Static Folder
// ---------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------------
// 📌 IMPORT ROUTES
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
// 🚀 USE ROUTES (with /api/)
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
app.use("/api/auth", authRoutes);
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
  res.json({ status: "ok" });
});

// Not Found
app.all("*", (req, res, next) => {
  next(new AppError(Can't find ${req.originalUrl} ❌, 404));
});

app.use(globalErrorHandler);

// ---------------------------
// 🟢 DATABASE
// ---------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Error:", err);
    process.exit(1);
  });

// ---------------------------
// 🟡 SOCKET.IO
// ---------------------------
const PORT = process.env.PORT || 5000;

const serverHTTP = http.createServer(app);

const io = new Server(serverHTTP, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

// Start server
serverHTTP.listen(PORT, "0.0.0.0", () =>
  console.log(🚀 Backend running on port ${PORT})
);
