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

// Fix dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(_filename);

// Load ENV
dotenv.config();

// ---------------------------
// ALLOWED ORIGINS
// ---------------------------
const FRONTEND = "https://ranx24.com";
const ADMIN = "https://admin.ranx24.com";   // agar admin nahi hai to rehne do

const allowedOrigins = [
  FRONTEND,
  ADMIN,
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

// ---------------------------
// GLOBAL CORS
// ---------------------------
const app = express();

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      console.log("❌ BLOCKED ORIGIN:", origin);
      return cb(new Error("CORS Blocked"));
    },
    credentials: true,
  })
);

// ---------------------------
// HELMET (with CORS fixed)
// ---------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  })
);

// ---------------------------
// BODY PARSER
// ---------------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// STATIC FOLDER
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------------
// ROUTES
// ---------------------------
import locationRoutes from "./router/locationRoutes.js";
import bannerRoutes from "./router/bannerRoutes.js";
import categoryRoutes from "./router/categoryRoutes.js";
import authRoutes from "./router/authRoutes.js";

// YOUR ROUTES
app.use("/api/location", locationRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);

// HEALTH
app.get("/", (req, res) => {
  res.json({ status: "Backend is running" });
});

// ---------------------------
// DATABASE
// ---------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log("DB ERROR:", err));

// ---------------------------
// SOCKET.IO
// ---------------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ---------------------------
// SOCKET EVENTS
// ---------------------------
io.on("connection", (socket) => {
  console.log("SOCKET CONNECTED:", socket.id);

  socket.on("disconnect", () => console.log("SOCKET DISCONNECT:", socket.id));
});

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port:", PORT);
});
