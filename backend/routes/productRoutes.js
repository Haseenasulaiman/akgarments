import express from "express";
import { body } from "express-validator";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  listCategories,
  listProducts,
  toggleProductActive,
  updateProduct,
  exportProductsCsv,
} from "../controllers/productController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", listProducts);
router.get("/categories", listCategories);
router.get("/:slug", getProductBySlug);
router.get("/admin/export/csv", protect, adminOnly, exportProductsCsv);

router.post(
  "/",
  protect,
  adminOnly,
  [
    body("name").notEmpty(),
    body("slug").notEmpty(),
    body("category").notEmpty(),
    body("price").isNumeric(),
  ],
  createProduct
);

router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.patch("/:id/toggle-active", protect, adminOnly, toggleProductActive);

export default router;

