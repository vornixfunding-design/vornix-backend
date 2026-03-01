import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import { sendOtpEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET;
const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES || '10');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function register(req, res) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const full_name = String(req.body?.full_name || '').trim();

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full_name are required' });
    }

    const { data: existingUser, error: userLookupError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userLookupError) {
      return res.status(500).json({ error: 'Failed to check existing user' });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: user, error: userInsertError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        full_name,
        is_verified: false,
      })
      .select('id, email, full_name, is_verified')
      .single();

    if (userInsertError || !user) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const otp = generateOtp();
    const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { error: otpInsertError } = await supabase.from('otps').insert({
      email,
      otp,
      expires_at,
      used: false,
    });

    if (otpInsertError) {
      return res.status(500).json({ error: 'Failed to save OTP' });
    }

    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: 'OTP sent to email', email });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to register user' });
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
    const { data: otpData, error: otpLookupError } = await supabase
      .from('otps')
      .select('id, email')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .gt('expires_at', now)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpLookupError || !otpData) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const { error: otpUpdateError } = await supabase
      .from('otps')
      .update({ used: true })
      .eq('id', otpData.id);

    if (otpUpdateError) {
      return res.status(500).json({ error: 'Failed to update OTP status' });
    }

    const { error: userVerifyError } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('email', email);

    if (userVerifyError) {
      return res.status(500).json({ error: 'Failed to verify user' });
    }

    const { data: user, error: userFetchError } = await supabase
      .from('users')
      .select('id, email, full_name, is_verified')
      .eq('email', email)
      .maybeSingle();

    if (userFetchError || !user) {
      return res.status(500).json({ error: 'Failed to fetch user' });
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

export async function login(req, res) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: user, error: userFetchError } = await supabase
      .from('users')
      .select('id, email, full_name, is_verified, password_hash')
      .eq('email', email)
      .maybeSingle();

    if (userFetchError) {
      return res.status(500).json({ error: 'Failed to fetch user' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash || '');

    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' },
    );

    const { password_hash: _passwordHash, ...safeUser } = user;

    return res.status(200).json({ token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to login' });
  }
}

export async function resendOtp(req, res) {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    await supabase.from('otps').update({ used: true }).eq('email', email).eq('used', false);

    const otp = generateOtp();
    const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    const { error: otpInsertError } = await supabase.from('otps').insert({
      email,
      otp,
      expires_at,
      used: false,
    });

    if (otpInsertError) {
      return res.status(500).json({ error: 'Failed to save OTP' });
    }

    await sendOtpEmail(email, otp);

    return res.status(200).json({ message: 'OTP resent' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to resend OTP' });
  }
}

export { generateOtp };
