import express from "express";
import { createSupportRequest } from "../controllers/supportController.js";

const router = express.Router();

router.post("/", createSupportRequest);

export default router;

