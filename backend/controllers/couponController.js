import { validationResult } from "express-validator";
import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";

export const createCoupon = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const coupon = await Coupon.create(req.body);
    res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
};

export const listCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find()
      .sort({ createdAt: -1 })
      .populate("usageLog.user", "name email");
    res.json(coupons);
  } catch (err) {
    next(err);
  }
};

export const updateCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json(coupon);
  } catch (err) {
    next(err);
  }
};

export const deleteCoupon = async (req, res, next) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findById(id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    await coupon.deleteOne();
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    next(err);
  }
};

export const applyCoupon = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const now = new Date();
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      $and: [
        { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
        { $or: [{ validTo: null }, { validTo: { $gte: now } }] },
      ],
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    const threshold = coupon.thresholdAmount || coupon.minOrderValue || 0;

    // Compute cumulative spend for this user since the last time they used this coupon
    let lastUsedAt = null;
    const userId = req.user?._id;
    if (userId) {
      const logsForUser = (coupon.usageLog || [])
        .filter((entry) => entry.user && String(entry.user) === String(userId))
        .sort(
          (a, b) =>
            new Date(b.usedAt || b.createdAt || 0) -
            new Date(a.usedAt || a.createdAt || 0)
        );
      lastUsedAt = logsForUser[0]?.usedAt || null;
    }

    const match = {};
    if (userId) {
      match.user = userId;
    }
    if (lastUsedAt) {
      match.createdAt = { $gt: lastUsedAt };
    }

    let cumulative = amount;
    if (userId) {
      const agg = await Order.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$totals.grandTotal" } } },
      ]);
      cumulative += agg[0]?.total || 0;
    }

    if (cumulative < threshold) {
      return res.status(400).json({
        message: `Total spend too low for this coupon. You have ₹${cumulative.toFixed(
          0
        )} towards this offer, need at least ₹${threshold}.`,
      });
    }

    let discount =
      coupon.discountType === "percentage"
        ? (amount * coupon.amount) / 100
        : coupon.amount;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }

    const payable = amount - discount;

    const response = {
      discount,
      payable,
      couponId: coupon._id,
      code: coupon.code,
      threshold,
    };

    res.json(response);
  } catch (err) {
    next(err);
  }
};

