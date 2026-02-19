import supabase from '../config/supabase.js';

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOtpToEmail(email) {
  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('otp_codes')
    .insert({
      email,
      otp,
      expires_at: expiresAt,
    });

  if (error) {
    throw new Error('Failed to store OTP');
  }

  console.log('OTP for', email, '=', otp); // TEMP (remove when using real email)

  return true;
}

export async function verifyOtp(email, otp) {
  const { data, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .eq('verified', false)
    .single();

  if (error || !data) {
    throw new Error('Invalid OTP');
  }

  const now = new Date();
  if (now > new Date(data.expires_at)) {
    throw new Error('OTP expired');
  }

  await supabase
    .from('otp_codes')
    .update({ verified: true })
    .eq('id', data.id);

  return true;
}
