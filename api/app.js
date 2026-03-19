import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connect } from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/authRoutes.js";
import membersRoutes from "./routes/membersRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import candidaturesRoutes from "./routes/candidaturesRoutes.js";
import SubmissionsRoutes from "./routes/submissionsRoutes.js";
import regionRoutes from "./routes/regions.js";
import creathonRoutes from "./routes/creathonRoutes.js";
import mentorRoutes from "./routes/mentorRoutes.js";
import trainingsRoutes from "./routes/trainingsRoutes.js";
import acceptedParticipantsRouter from "./routes/acceptedParticipants.js";
import TrainingsTackingRoutes from "./routes/trainingsTrackingRoutes.js";
import outputsRoutes from "./routes/outputRoutes.js";

dotenv.config();

const app = express();

// CRITICAL: Cookie parser MUST come before CORS and routes
app.use(cookieParser());

const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ============================================
// CRITICAL CORS CONFIGURATION FOR SAME-DOMAIN
// ============================================
const isProduction = process.env.NODE_ENV === "production";

// In your backend server.js
const corsOptions = {
  origin: ["http://localhost:3000"],
  credentials: true,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// CRITICAL: Handle preflight requests explicitly
app.options("*", cors(corsOptions));

// ============================================
// Helmet for security (configured to not block cookies)
// ============================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Disable if causing issues
  }),
);

// Body parser
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Origin:", req.headers.origin);
  console.log("Cookies:", req.cookies);
  next();
});

// Static files
app.use(
  "/api/uploads",
  express.static(uploadsDir, {
    dotfiles: "allow",
    index: false,
    setHeaders: (res, filePath) => {
      res.setHeader(
        "Access-Control-Allow-Origin",
        "https://incubation.tacir.tn",
      );
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

      // Log static file requests for debugging
      console.log("Static file served:", filePath);
    },
  }),
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/members", membersRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/candidatures", candidaturesRoutes);
app.use("/api/submissions", SubmissionsRoutes);
app.use("/api/regions", regionRoutes);
app.use("/api/creathons", creathonRoutes);
app.use("/api/mentors", mentorRoutes);
app.use("/api/trainings", trainingsRoutes);
app.use("/api/accepted-participants", acceptedParticipantsRouter);
app.use("/api/trainingsTracking", TrainingsTackingRoutes);
app.use("/api/outputs", outputsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Error occurred:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// Database connection
connect(process.env.DB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`CORS origin: ${corsOptions.origin}`);
});
