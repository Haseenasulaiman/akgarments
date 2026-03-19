import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";

const router = express.Router();

router.post(
  "/razorpay/create",
  protect,
  [body("totals.grandTotal").isNumeric()],
  createRazorpayOrder
);

router.post(
  "/razorpay/verify",
  protect,
  [
    body("razorpayPaymentId").notEmpty(),
    body("razorpayOrderId").notEmpty(),
    body("razorpaySignature").notEmpty(),
    body("totals.grandTotal").isNumeric(),
  ],
  verifyRazorpayPayment
);

export default router;

