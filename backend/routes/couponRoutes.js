import express from "express";
import { body } from "express-validator";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  listCoupons,
  updateCoupon,
} from "../controllers/couponController.js";

const router = express.Router();

router.post(
  "/apply",
  protect,
  [body("code").notEmpty(), body("amount").isNumeric()],
  applyCoupon
);

router.get("/", protect, adminOnly, listCoupons);

router.post(
  "/",
  protect,
  adminOnly,
  [
    body("code").notEmpty(),
    body("discountType").isIn(["percentage", "fixed"]),
    body("amount").isNumeric(),
  ],
  createCoupon
);

router.put("/:id", protect, adminOnly, updateCoupon);
router.delete("/:id", protect, adminOnly, deleteCoupon);

export default router;

