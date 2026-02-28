import { Router } from "express";
import {
  forgotPassword,
  login,
  register,
  resetPassword,
  sendOtp,
  verify,
} from "../controllers/authController.js";

const router = Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/send-otp", sendOtp);
router.post("/auth/verify-otp", verify);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPassword);

export default router;
