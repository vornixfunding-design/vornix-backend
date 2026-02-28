// src/routes/otpRoutes.js
import express from "express";
import { sendOTP, checkOTP } from "../controllers/otpController.js";

const router = express.Router();

router.post("/send", sendOTP);
router.post("/verify", checkOTP);

export default router;
