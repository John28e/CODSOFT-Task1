import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

// --------------- Middleware ---------------
app.use(
    cors({
          origin: process.env.CLIENT_URL || "http://localhost:5173",
          credentials: true,
    })
  );
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(async (req, res, next) => {
    try {
          await connectDB();
          next();
    } catch (err) {
          next(err);
    }
});

// --------------- Routes ---------------

// Health check
app.get("/api/health", (req, res) => {
    res.json({
          success: true,
          message: "Server is running",
          timestamp: new Date().toISOString(),
    });
});

// Feature routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);

// --------------- Error handling ---------------
app.use(notFound);
app.use(errorHandler);

// --------------- DB Connection ---------------
// Connect at module load time so the connection is reused across
// warm Vercel serverless function invocations.
connectDB();

// --------------- Local dev only ---------------
// In a Vercel serverless environment, app.listen() must NOT be called.
// This block is skipped when Vercel imports this module as a function handler.
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
          console.log(`Server running on port ${PORT} (${process.env.NODE_ENV || "development"})`);
    });
}

// Export the Express app as the default export for Vercel
export default app;
// redeploy
// root update
