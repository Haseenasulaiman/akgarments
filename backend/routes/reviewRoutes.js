import express from "express";
import { body } from "express-validator";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  adminListReviews,
  adminUpdateReviewStatus,
  createOrUpdateReview,
  listProductReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/product/:productId", listProductReviews);

router.post(
  "/",
  protect,
  [
    body("productId").notEmpty(),
    body("rating").isInt({ min: 1, max: 5 }),
  ],
  createOrUpdateReview
);

router.get("/admin", protect, adminOnly, adminListReviews);
router.put("/admin/:id/status", protect, adminOnly, adminUpdateReviewStatus);

export default router;

