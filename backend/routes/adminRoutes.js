import express from "express";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  deleteUser,
  getSettings,
  getUserOrders,
  listUsers,
  lowStockInventory,
  overviewStats,
  revenueSeries,
  toggleBlockUser,
  topProductsStats,
  updateSettings,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/users", listUsers);
router.patch("/users/:id/block", toggleBlockUser);
router.delete("/users/:id", deleteUser);
router.get("/users/:id/orders", getUserOrders);

router.get("/inventory/low-stock", lowStockInventory);

router.get("/settings", getSettings);
router.put("/settings", updateSettings);

router.get("/stats/overview", overviewStats);
router.get("/stats/revenue-series", revenueSeries);
router.get("/stats/top-products", topProductsStats);

export default router;

