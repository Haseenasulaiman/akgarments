import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Setting from "../models/Setting.js";

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const toggleBlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot block another admin" });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ id: user._id, isBlocked: user.isBlocked });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete an admin" });
    }
    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const { id } = req.params;
    const orders = await Order.find({ user: id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const lowStockInventory = async (req, res, next) => {
  try {
    const thresholdSetting = await Setting.findOne({
      key: "lowStockThreshold",
    });
    const threshold = Number(thresholdSetting?.value || 5);

    const products = await Product.find({
      "sizes.stock": { $lte: threshold },
      isDeleted: false,
    });
    res.json({ threshold, products });
  } catch (err) {
    next(err);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    const docs = await Setting.find();
    const map = {};
    docs.forEach((s) => {
      map[s.key] = s.value;
    });
    res.json(map);
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const entries = Object.entries(req.body || {});
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of entries) {
      // upsert
      // eslint-disable-next-line no-await-in-loop
      await Setting.findOneAndUpdate(
        { key },
        { value },
        { new: true, upsert: true }
      );
    }
    const updated = await Setting.find();
    const map = {};
    updated.forEach((s) => {
      map[s.key] = s.value;
    });
    res.json(map);
  } catch (err) {
    next(err);
  }
};

export const overviewStats = async (req, res, next) => {
  try {
    const [orders, users, totalProducts, recentOrders] = await Promise.all([
      Order.find(),
      User.find({ role: "customer" }),
      Product.countDocuments({ isDeleted: false }),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email"),
    ]);

    const revenue = orders
      .filter((o) => o.paymentStatus === "Success")
      .reduce((sum, o) => sum + (o.totals?.grandTotal || 0), 0);

    const byStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = users.filter((u) => u.createdAt >= last30).length;

    res.json({
      revenue,
      totalOrders: orders.length,
      ordersByStatus: byStatus,
      totalCustomers: users.length,
      newCustomersLast30Days: newUsers,
      totalProducts,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
};

export const topProductsStats = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 5;
    const rows = await Order.aggregate([
      { $match: { paymentStatus: "Success" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: {
            product: "$items.product",
            name: "$items.nameSnapshot",
          },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: limit },
    ]);

    const mapped = rows.map((r) => ({
      productId: r._id.product,
      name: r._id.name,
      quantity: r.totalQuantity,
      revenue: r.totalRevenue,
    }));

    res.json(mapped);
  } catch (err) {
    next(err);
  }
};

const toNumber = (v, fallback) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const startOfDayUtc = (d) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

export const revenueSeries = async (req, res, next) => {
  try {
    const now = new Date();
    const dailyDays = toNumber(req.query.dailyDays, 14);
    const weeklyWeeks = toNumber(req.query.weeklyWeeks, 12);
    const monthlyMonths = toNumber(req.query.monthlyMonths, 12);

    const paidMatch = { paymentStatus: "Success" };

    const dayStart = new Date(now.getTime() - dailyDays * 24 * 60 * 60 * 1000);
    const weekStart = new Date(now.getTime() - weeklyWeeks * 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (monthlyMonths - 1), 1));

    const [daily, weekly, monthly] = await Promise.all([
      Order.aggregate([
        { $match: { ...paidMatch, createdAt: { $gte: dayStart } } },
        {
          $group: {
            _id: {
              $dateTrunc: { date: "$createdAt", unit: "day", timezone: "UTC" },
            },
            revenue: { $sum: "$totals.grandTotal" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { ...paidMatch, createdAt: { $gte: weekStart } } },
        {
          $group: {
            _id: {
              $dateTrunc: { date: "$createdAt", unit: "week", timezone: "UTC" },
            },
            revenue: { $sum: "$totals.grandTotal" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { ...paidMatch, createdAt: { $gte: monthStart } } },
        {
          $group: {
            _id: {
              $dateTrunc: { date: "$createdAt", unit: "month", timezone: "UTC" },
            },
            revenue: { $sum: "$totals.grandTotal" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    // Fill daily gaps with 0s for nicer charts
    const dailyMap = new Map(daily.map((r) => [new Date(r._id).toISOString().slice(0, 10), r]));
    const filledDaily = [];
    for (let i = dailyDays - 1; i >= 0; i -= 1) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = startOfDayUtc(d).toISOString().slice(0, 10);
      const row = dailyMap.get(key);
      filledDaily.push({
        date: key,
        revenue: row ? row.revenue : 0,
        orders: row ? row.orders : 0,
      });
    }

    res.json({
      daily: filledDaily,
      weekly: weekly.map((r) => ({
        date: new Date(r._id).toISOString().slice(0, 10),
        revenue: r.revenue,
        orders: r.orders,
      })),
      monthly: monthly.map((r) => ({
        date: new Date(r._id).toISOString().slice(0, 7),
        revenue: r.revenue,
        orders: r.orders,
      })),
    });
  } catch (err) {
    next(err);
  }
};

