import { generateOTP, sendOTPEmail, saveOTP, verifyOTP } from "../services/otpService.js";

export async function sendOTP(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = generateOTP();

    await saveOTP(email, otp);
    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP", details: err.message });
  }
}

export async function checkOTP(req, res) {
  try {
    const { email, otp } = req.body;

    const valid = await verifyOTP(email, otp);
    if (!valid) return res.status(400).json({ error: "Invalid OTP" });

    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    res.status(500).json({ error: "Verification failed", details: err.message });
  }
}
