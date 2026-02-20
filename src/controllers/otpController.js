import { generateOTP, verifyOTP } from '../services/otpService.js';

export async function sendOTP(req, res) {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    await generateOTP(email);
    return res.json({ success: true, message: 'OTP sent' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send OTP', details: err.message });
  }
}

export async function verifyOTPController(req, res) {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });

  try {
    const ok = await verifyOTP(email, otp);

    if (!ok) return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });

    return res.json({ success: true, message: 'OTP verified' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed OTP verification', details: err.message });
  }
}
