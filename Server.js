import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import connectDB from "./config/mongodb.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Routes
import authRouter from "./routes/authRoutes.js";
import postsRouter from "./routes/postsRoutes.js";
import usersRouter from "./routes/userRoutes.js";
import pickupRoutes from "./routes/pickupRoutes.js";
import deliveryAgentRoutes from "./routes/deliveryAgentRoutes.js";
import centersRoutes from "./routes/centersRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";

dotenv.config();
const app = express();

// ======== GLOBAL CORS FIX =========
// يسمح لأي دومين × ويشتغل مع الكوكيز
app.use(
  cors({
    origin: true, // أي origin مسموح
    credentials: true,
  })
);

// حل مشكلة الـ preflight OPTIONS
app.options("*", cors({
  origin: true,
  credentials: true,
}));

// ===================================

app.use(express.json());
app.use(cookieParser());

// Static folders
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Connect DB
connectDB();

// Create HTTP server + SocketIO
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

// attach io
app.use("/api/pickups", (req, res, next) => {
  req.io = io;
  next();
}, pickupRoutes);

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", usersRouter);
app.use("/api/delivery-agents", deliveryAgentRoutes);
app.use("/api/centers", centersRoutes);
app.use("/api/progress", progressRoutes);

// Root
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
