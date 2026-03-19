import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.put("/update", protect, updateCartItem);
router.delete("/remove/:itemId", protect, removeCartItem);
router.delete("/clear", protect, clearCart);

export default router;

