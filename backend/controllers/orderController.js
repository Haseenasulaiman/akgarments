import { validationResult } from "express-validator";
import path from "path";
import { fileURLToPath } from "url";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import generateInvoice from "../utils/invoiceGenerator.js";
import { sendOrderConfirmation, sendOrderStatusEmail } from "../utils/emailService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const adminListOrders = async (req, res, next) => {
  try {
    const { status, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    const orders = await Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const adminGetOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("items.product", "name category");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const adminUpdateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findById(id).populate("user", "name email");
    if (!order) return res.status(404).json({ message: "Order not found" });
    order.status = status;
    await order.save();
    if (order.user?.email) {
      sendOrderStatusEmail(order.user, order, status).catch(() => {});
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { totals, shippingAddress, coupon: couponPayload } = req.body;

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
        return res
          .status(400)
          .json({ message: `Product not available: ${item.product.name}` });
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
      paymentMethod: "COD",
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
          "Failed to update coupon usage for order",
          order._id,
          couponErr?.message || couponErr
        );
      }
    }

    const invoicePath = await generateInvoice(order);
    order.invoicePath = invoicePath;
    await order.save();

    // Build a reachable base URL (important for Android devices: avoid "localhost")
    const reqBase = `${req.protocol}://${req.get("host")}`;
    const base =
      process.env.BACKEND_PUBLIC_URL ||
      reqBase ||
      `http://localhost:${process.env.PORT || 5000}`;
    // Use download endpoint URL (for web UI) but attach PDF in email
    const invoiceUrl = `${base}/api/invoices/${order._id}/download`;
    const populated = await order.populate("user");

    // Resolve absolute path on disk for attachment
    const invoiceDiskPath = path.join(
      __dirname,
      "..",
      "invoices",
      `${order._id}.pdf`
    );

    // Send email in background so placing order feels faster
    sendOrderConfirmation(populated.user, order, invoiceUrl, invoiceDiskPath).catch(
      (emailErr) => {
        // eslint-disable-next-line no-console
        console.error(
          "Failed to send order confirmation email:",
          emailErr?.message || emailErr
        );
      }
    );

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

export const cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!["Pending", "Processing"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "This order can no longer be cancelled" });
    }
    const { reason } = req.body || {};
    order.status = "Cancelled";
    order.cancellationReason = reason || "Cancelled by customer";
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const requestReturn = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "Delivered") {
      return res
        .status(400)
        .json({ message: "Only delivered orders can be returned" });
    }
    const created = new Date(order.createdAt);
    const today = new Date();
    const diffDays = (today - created) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      return res
        .status(400)
        .json({ message: "Return window has expired for this order" });
    }
    if (order.returnStatus !== "None") {
      return res
        .status(400)
        .json({ message: "Return already requested for this order" });
    }
    order.returnStatus = "Requested";
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};
