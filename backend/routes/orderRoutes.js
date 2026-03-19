import express from "express";
import { body } from "express-validator";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  adminGetOrderById,
  adminListOrders,
  adminUpdateStatus,
  createOrder,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  requestReturn,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", protect, getMyOrders);

router.post(
  "/",
  protect,
  [
    body("totals.subtotal").isNumeric(),
    body("totals.grandTotal").isNumeric(),
    body("shippingAddress.line1").notEmpty(),
    body("shippingAddress.city").notEmpty(),
    body("shippingAddress.state").notEmpty(),
    body("shippingAddress.pincode").notEmpty(),
  ],
  createOrder
);

router.get("/admin/all", protect, adminOnly, adminListOrders);
router.put("/admin/:id/status", protect, adminOnly, adminUpdateStatus);
router.get("/admin/:id", protect, adminOnly, adminGetOrderById);

router.get("/:id", protect, getOrderById);
router.post("/:id/cancel", protect, cancelMyOrder);
router.post("/:id/return", protect, requestReturn);

export default router;

