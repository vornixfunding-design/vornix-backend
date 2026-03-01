import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import { sendOtpEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET;
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || '10');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtp(req, res) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { error: otpError } = await supabase.from('otps').insert({
      email,
      otp,
      expires_at: expiresAt,
      used: false,
    });

    if (otpError) {
      return res.status(500).json({ error: 'Failed to save OTP' });
    }

    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: 'OTP sent' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to send OTP' });
  }
}

export async function verifyOtp(req, res) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const now = new Date().toISOString();
    const { data: otpData, error: otpQueryError } = await supabase
      .from('otps')
      .select('id, email, otp, used, expires_at')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpQueryError || !otpData) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const { error: otpUpdateError } = await supabase
      .from('otps')
      .update({ used: true })
      .eq('id', otpData.id);

    if (otpUpdateError) {
      return res.status(500).json({ error: 'Failed to update OTP status' });
    }

    const { data: existingUser, error: userFetchError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .maybeSingle();

    if (userFetchError) {
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    let user = existingUser;

    if (!user) {
      const { data: newUser, error: userInsertError } = await supabase
        .from('users')
        .insert({ email })
        .select('id, email')
        .single();

      if (userInsertError) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      user = newUser;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    return res.status(200).json({ token, user });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to verify OTP' });
  }
}

export { generateOtp };
