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

// ---------------------------
// FIX __dirname
// ---------------------------
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Validate env
try {
  validateEnv();
} catch (err) {
  console.error("❌ Env validation error:", err.message);
  process.exit(1);
}

const app = express();

// ---------------------------
// CORS FIX
// ---------------------------
const allowedOrigins = [
  "https://ranx24.com",
  "https://www.ranx24.com",
  "https://admin.ranx24.com",
  "http://localhost:5173",
  "http://localhost:3000"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.log("❌ Blocked Origin:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// Rate Limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// Body Parser
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Sanitization
app.use(sanitizeMongo);
app.use(sanitizeXSS);
app.use(customSanitize);

// Static
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------------
// ROUTES
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

// ---------------------------
// Health
// ---------------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now(),
    mongo: mongoose.connection.readyState,
  });
});

// ---------------------------
// NOT FOUND FIX
// ---------------------------
app.all("*", (req, res, next) => {
  next(new AppError(Can't find ${req.originalUrl}, 404));
});

// Error Handler
app.use(globalErrorHandler);

// ---------------------------
// DATABASE
// ---------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 MongoDB Connected"))
  .catch((err) => {
    console.error("❌ DB Error:", err);
    process.exit(1);
  });

// ---------------------------
// SOCKET.IO
// ---------------------------
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

// ---------------------------
// START SERVER
// ---------------------------
server.listen(PORT, "0.0.0.0", () =>
  console.log(🚀 Server running on port ${PORT})
);
