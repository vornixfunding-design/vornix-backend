const supabase = require('../config/supabase');
const { sendOtpEmail } = require('../services/emailService');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Register: create user, send OTP
exports.register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          email,
          password: hashedPassword,
          full_name,
          is_verified: false,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    // Generate and store OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES) * 60 * 1000);

    const { error: otpError } = await supabase
      .from('otps')
      .insert([{ email, otp, expires_at: expiresAt }]);

    if (otpError) throw otpError;

    // Send OTP email
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: 'OTP sent', email });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP required' });
    }

    // Find valid OTP
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

    // Mark OTP as used
    await supabase.from('otps').update({ used: true }).eq('id', otpRecord.id);

    // Update user as verified
    const { data: user, error: updateError } = await supabase
      .from('users')
      .update({ is_verified: true })
      .eq('email', email)
      .select()
      .single();

    if (updateError) throw updateError;

    // Generate JWT
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
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if verified
    if (!user.is_verified) {
      return res.status(403).json({ error: 'Email not verified' });
    }

    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
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
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRY_MINUTES) * 60 * 1000);

    // Store new OTP
    const { error: otpError } = await supabase
      .from('otps')
      .insert([{ email, otp, expires_at: expiresAt }]);

    if (otpError) throw otpError;

    // Send email
    await sendOtpEmail(email, otp);

    res.json({ message: 'OTP resent' });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};
