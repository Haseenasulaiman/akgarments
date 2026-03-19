import express from "express";
import { body } from "express-validator";
import { protect } from "../middleware/authMiddleware.js";
import {
  deleteAddress,
  getMe,
  updateMe,
  upsertAddress,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, getMe);

router.put(
  "/me",
  protect,
  [
    body("name").optional().isString(),
    body("phone").optional().isString(),
  ],
  updateMe
);

router.put(
  "/me/address",
  protect,
  [
    body("line1").notEmpty().withMessage("Address line1 is required"),
    body("city").notEmpty().withMessage("City is required"),
    body("state").notEmpty().withMessage("State is required"),
    body("pincode").notEmpty().withMessage("Pincode is required"),
  ],
  upsertAddress
);

router.delete("/me/address/:addressId", protect, deleteAddress);

export default router;

