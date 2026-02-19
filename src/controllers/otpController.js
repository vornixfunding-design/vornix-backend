import { sendOtpToEmail, verifyOtp } from '../services/otpService.js';

export async function requestOtp(req, res) {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    await sendOtpToEmail(email);
    return res.json({ success: true, message: 'OTP sent' });
  } catch {
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
}

export async function verifyOtpController(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP required' });
  }

  try {
    await verifyOtp(email, otp);
    return res.json({ success: true });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
