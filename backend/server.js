// server.js (FULL WORKING)

// -------------------------
// Core Imports
// -------------------------
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";

// Custom Imports
import AppError from "./utils/AppError.js";
import globalErrorHandler from "./middleware/errorMiddleware.js";
import { sanitizeMongo, sanitizeXSS, customSanitize } from "./middleware/sanitize.js";

// -------------------------
// Fix __dirname + __filename in ES Modules
// -------------------------
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// -------------------------
// Load .env
// -------------------------
dotenv.config();

// -------------------------
// Validate Environment
// -------------------------
import validateEnv from "./config/validateEnv.js";

try {
    validateEnv();
} catch (error) {
    console.error("❌ Env validation error:", error.message);
    process.exit(1);
}

// -------------------------
// Express App
// -------------------------
const app = express();

// -------------------------
// Allowed Origins
// -------------------------
const FRONTEND = process.env.CLIENT_URL || "https://ranx24.com"; 
const ADMIN = process.env.ADMIN_URL || null;

const allowedOrigins = [
    FRONTEND,
    ADMIN,
    "http://localhost:5173",
    "http://localhost:3000",
].filter(Boolean);

// -------------------------
// Global CORS
// -------------------------
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);

            console.log("❌ Blocked by CORS:", origin);
            return callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// -------------------------
// Helmet Security
// -------------------------
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
        contentSecurityPolicy: false,
    })
);

// -------------------------
// Rate Limiters
// -------------------------
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
});
app.use(limiter);

// -------------------------
// Body Parser
// -------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Sanitization
app.use(sanitizeMongo);
app.use(sanitizeXSS);
app.use(customSanitize);

// -------------------------
// Static Folder
// -------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------------
// Import Routes
// -------------------------
import adminRoutes from "./router/adminRoutes.js";
import workerRoutes from "./router/workerRoutes.js";
import userRoutes from "./router/userRoutes.js";
import bookingRoutes from "./router/bookingRoutes.js";
import categoryRoutes from "./router/categoryRoutes.js";
import bannerRoutes from "./router/bannerRoutes.js";
import locationRoutes from "./router/locationRoutes.js";
import authRoutes from "./router/authRoutes.js";
import cartRoutes from "./router/cartRoutes.js";
import cityRoutes from "./router/cityRoutes.js";
import reviewRoutes from "./router/reviewRoutes.js";
import paymentRoutes from "./router/paymentRoutes.js";
import notificationRoutes from "./router/notificationRoutes.js";
import supportRoutes from "./router/supportRoutes.js";

// -------------------------
// Use Routes
// -------------------------
app.use("/api/admin", adminRoutes);
app.use("/api/workers", workerRoutes);
app.use("/api/users", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/support", supportRoutes);

// -------------------------
// Health Check
// -------------------------
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
});

// -------------------------
// Not Found
// -------------------------
app.all("*", (req, res, next) => {
    next(new AppError(Can't find ${req.originalUrl}, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

// -------------------------
// DB Connect
// -------------------------
mongoose
    .connect(process.env.MONGO_URI, { maxPoolSize: 10 })
    .then(() => console.log("🟢 MongoDB connected"))
    .catch((err) => {
        console.error("❌ MongoDB error:", err);
        process.exit(1);
    });

// -------------------------
// Socket Server
// -------------------------
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true },
});

io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
});

// -------------------------
// Start Server
// -------------------------
server.listen(PORT, "0.0.0.0", () => {
    console.log(🔥 Server running on port ${PORT});
});
