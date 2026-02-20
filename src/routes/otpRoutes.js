import { Router } from "express";
import { generateAndSendOtp, verifyOtp } from "../services/otpService.js";

const router = Router();

router.post("/send", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    await generateAndSendOtp(email);
    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ success: false, error: "OTP sending failed" });
  }
});

router.post("/verify", async (req, res) => {
  const { email, otp } = req.body;
  const result = await verifyOtp(email, otp);

  if (!result.valid) {
    return res.status(400).json({ valid: false, message: "Invalid OTP" });
  }

  return res.json({ valid: true });
});

export default router;
