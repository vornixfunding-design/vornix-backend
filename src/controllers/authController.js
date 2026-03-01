import supabase from '../config/supabase.js';
import { sendOtpEmail } from '../services/emailService.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function register(req, res) {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ email, password: hashedPassword, full_name, is_verified: false }])
      .select()
      .single();

    if (insertError) throw insertError;

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES) * 60 * 1000);

    const { error: otpError } = await supabase
      .from('otps')
      .insert([{ email, otp, expires_at: expiresAt }]);

    if (otpError) throw otpError;

    await sendOtpEmail(email, otp);
    res.status(200).json({ message: 'OTP sent', email });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }

    const { data: otpRecord, error: fetchError } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    await supabase.from('otps').update({ used: true }).eq('id', otpRecord.id);

    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('email', email)
      .select()
      .single();

    if (updateError) throw updateError;

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error('OTP verification error:', err);
    res.status(500).json({ error: 'Verification failed' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

export async function resendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES) * 60 * 1000);

    const { error: otpError } = await supabase
      .from('otps')
      .insert([{ email, otp, expires_at: expiresAt }]);

    if (otpError) throw otpError;

    await sendOtpEmail(email, otp);
    res.json({ message: 'OTP resent' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
}
