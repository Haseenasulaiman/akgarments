import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { downloadInvoice } from "./controllers/invoiceController.js";
import { sendOtpEmail } from "./utils/emailService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "akgarments-backend" });
});

// Static invoices
app.use("/invoices", express.static(path.join(__dirname, "invoices")));

// Invoice download (forces PDF download, regenerates if needed)
app.get("/api/invoices/:orderId/download", downloadInvoice);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/support", supportRoutes);

app.get("/api/test-email", async (req, res) => {
  try {
    console.log("Test email route hit");

    const fakeUser = {
      name: "Test User",
      email: process.env.SMTP_USER,
    };

    await sendOtpEmail(fakeUser, "123456");

    console.log("Test email sent successfully");

    res.json({
      ok: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Test email route failed:", error);
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
});

// 404
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

