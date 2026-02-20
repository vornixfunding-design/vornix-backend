import supabase from '../config/supabase.js';
import { sendEmail } from '../utils/email.js';

export async function generateOTP(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error } = await supabase.from('otps').insert({
    email,
    otp,
    expires_at,
  });

  if (error) throw error;

  await sendEmail(
    email,
    'Your Vornix OTP Code',
    `<h2>Your OTP: ${otp}</h2><p>This code expires in 5 minutes.</p>`
  );

  return true;
}

export async function verifyOTP(email, otp) {
  const { data, error } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .maybeSingle();

  if (error) throw error;
  if (!data) return false;

  const isExpired = new Date(data.expires_at) < new Date();
  if (isExpired) return false;

  await supabase.from('otps').delete().eq('email', email);

  return true;
}
