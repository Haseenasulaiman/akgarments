import crypto from "crypto";
import Razorpay from "razorpay";
import { validationResult } from "express-validator";
import path from "path";
import { fileURLToPath } from "url";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import generateInvoice from "../utils/invoiceGenerator.js";
import { sendOrderConfirmation } from "../utils/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay keys not configured");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { totals } = req.body;
    const amountInPaise = Math.round(Number(totals?.grandTotal || 0) * 100);

    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({ message: "Invalid order amount" });
    }

    const razorpay = getRazorpayInstance();

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
    });

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      totals,
      coupon: couponPayload,
      shippingAddress,
    } = req.body;

    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product"
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const items = [];
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      if (!product || product.isDeleted || !product.isActive) {
        return res.status(400).json({
          message: `Product not available: ${item.product.name}`,
        });
      }

      const sizeEntry = product.sizes.find((s) => s.size === item.size);
      if (!sizeEntry || sizeEntry.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name} - ${item.size}`,
        });
      }
      sizeEntry.stock -= item.quantity;
      await product.save();

      items.push({
        product: product._id,
        nameSnapshot: product.name,
        imageSnapshot: product.images?.[0],
        categorySnapshot: product.category,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        priceSnapshot: item.priceSnapshot,
        subtotal: item.totalItemPrice,
      });
    }

    const order = await Order.create({
      user: req.user._id,
      items,
      totals,
      coupon: couponPayload
        ? {
            couponId: couponPayload.couponId,
            code: couponPayload.code,
            discount: couponPayload.discount || 0,
          }
        : undefined,
      status: "Processing",
      paymentStatus: "Success",
      paymentMethod: "Razorpay",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      shippingAddress,
    });

    cart.items = [];
    await cart.save();

    // If a coupon was applied, increment usage and log this order
    if (couponPayload?.couponId && totals?.discount) {
      try {
        const coupon = await Coupon.findById(couponPayload.couponId);
        if (coupon) {
          coupon.usedCount = (coupon.usedCount || 0) + 1;
          coupon.usageLog.push({
            user: req.user._id,
            order: order._id,
            amount: totals.subtotal,
            discount: totals.discount,
          });
          await coupon.save();
        }
      } catch (couponErr) {
        // eslint-disable-next-line no-console
        console.error(
          "Failed to update coupon usage for Razorpay order",
          order._id,
          couponErr?.message || couponErr
        );
      }
    }

    const invoicePath = await generateInvoice(order);
    order.invoicePath = invoicePath;
    await order.save();

    const populated = await order.populate("user");
    const reqBase = `${req.protocol}://${req.get("host")}`;
    const base =
      process.env.BACKEND_PUBLIC_URL ||
      reqBase ||
      `http://localhost:${process.env.PORT || 5000}`;
    const invoiceUrl = `${base}/api/invoices/${order._id}/download`;

    // `generateInvoice()` returns a URL-like path (e.g. `/invoices/<id>.pdf`).
    // For Brevo attachments we need the absolute filesystem path.
    const invoiceDiskPath = path.join(
      __dirname,
      "..",
      "invoices",
      `${order._id}.pdf`
    );

    sendOrderConfirmation(
      populated.user,
      order,
      invoiceUrl,
      invoiceDiskPath
    ).catch((emailErr) => {
      // eslint-disable-next-line no-console
      console.error(
        "Failed to send order confirmation email (Razorpay):",
        emailErr?.message || emailErr
      );
    });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

