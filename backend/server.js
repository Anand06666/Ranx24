// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";

import AppError from "./utils/AppError.js";
import globalErrorHandler from "./middleware/errorMiddleware.js";
import validateEnv from "./config/validateEnv.js";

// FIX dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Load .env file
dotenv.config();

// Validate ENV
validateEnv();

// EXPRESS APP
const app = express();

// ----------------------------------
// 🔥 FIXED PRODUCTION URLs
// ----------------------------------
const FRONTEND_URL = process.env.CLIENT_URL || "https://ranx24.com";
const ADMIN_URL = process.env.ADMIN_URL || null;

const allowedOrigins = [
  FRONTEND_URL,
  ADMIN_URL,
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174"
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

// ----------------------------------
// 🚀 GLOBAL CORS (FULL FIX)
// ----------------------------------
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked By CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ----------------------------------
// 🚀 SECURITY HEADERS
// ----------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// ----------------------------------
// 🚀 RATE LIMITING
// ----------------------------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
  })
);

// BODY PARSER
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// STATIC FOLDER
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ----------------------------------
// 🚀 IMPORT ROUTES
// ----------------------------------
import authRoutes from "./router/authRoutes.js";
import categoryRoutes from "./router/categoryRoutes.js";
import bannerRoutes from "./router/bannerRoutes.js";
import locationRoutes from "./router/locationRoutes.js";
// … (BAAKI SAARI ROUTES YAHI ADD KARDO)

// USE ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/location", locationRoutes);
// … (BAAKI ROUTES)

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// BASE ROUTE
app.get("/", (req, res) => {
  res.send("Backend Running Successfully 🚀");
});

// NOT FOUND
app.all("*", (req, res, next) => {
  next(new AppError(Can't find ${req.originalUrl}, 404));
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

// ----------------------------------
// 🚀 MONGO DB CONNECT
// ----------------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error", err));

// ----------------------------------
// 🚀 START SERVER + SOCKET IO
// ----------------------------------
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// SOCKET EVENTS
io.on("connection", (socket) => {
  console.log("Socket Connected:", socket.id);

  socket.on("join", (room) => socket.join(room));
  socket.on("disconnect", () => console.log("Socket Disconnected"));
});

// INJECT SOCKET INTO EXPRESS
app.use((req, res, next) => {
  req.io = io;
  next();
});

// START SERVER
server.listen(PORT, "0.0.0.0", () =>
  console.log(🔥 Server running on port ${PORT})
);
