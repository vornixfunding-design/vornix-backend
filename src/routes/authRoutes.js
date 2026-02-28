import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { upsertProfile } from "../controllers/authController.js";

const router = express.Router();

router.post("/profile", authMiddleware, upsertProfile);

export default router;
