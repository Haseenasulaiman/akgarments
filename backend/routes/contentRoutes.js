import express from "express";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import {
  adminDeleteBanner,
  adminListBanners,
  adminUpsertBanner,
  adminUpsertPage,
  getPage,
  listBanners,
} from "../controllers/contentController.js";

const router = express.Router();

router.get("/banners", listBanners);
router.get("/pages/:slug", getPage);

router.get("/admin/banners", protect, adminOnly, adminListBanners);
router.put("/admin/banners/:id", protect, adminOnly, adminUpsertBanner);
router.delete("/admin/banners/:id", protect, adminOnly, adminDeleteBanner);

router.put("/admin/pages/:slug", protect, adminOnly, adminUpsertPage);

export default router;

