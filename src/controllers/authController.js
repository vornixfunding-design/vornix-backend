import jwt from 'jsonwebtoken';
import { generateOTP, verifyOTP } from '../services/otpService.js';
import { sendOtpEmail } from '../utils/email.js';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const JWT_SECRET = process.env.AUTH_JWT_SECRET || 'dev-auth-secret';
const JWT_EXPIRES_IN = process.env.AUTH_JWT_EXPIRES_IN || '7d';

export async function sendOtp(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({ error: 'email is required' });
    }

    const otp = generateOTP(email);
    await sendOtpEmail({ email, otp });

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Failed to send OTP',
    });
  }
}

export async function verifyOtp(req, res) {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ error: 'email and otp are required' });
    }

    const isValid = verifyOTP(email, otp);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    const token = jwt.sign({ email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return res.status(200).json({
      success: true,
      token,
      user: { email },
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || 'OTP verification failed',
    });
  }
}

export async function getProfile(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
}
