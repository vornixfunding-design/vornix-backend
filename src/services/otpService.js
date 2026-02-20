import supabase from '../config/supabase.js';
import { sendEmail } from '../utils/email.js';

const OTP_TABLE = 'otps';

export async function generateAndSendOtp(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await supabase.from(OTP_TABLE).delete().eq('email', email);

  await supabase.from(OTP_TABLE).insert({
    email,
    otp,
    created_at: new Date().toISOString(),
  });

  const html = `
      <div style="font-family:Arial;padding:20px;background:#0f172a;color:white;border-radius:10px">
        <h2 style="color:#38bdf8">VORNIX OTP Verification</h2>
        <p>Your OTP is:</p>
        <h1 style="font-size:32px;letter-spacing:4px">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `;

  await sendEmail(email, "Your Vornix OTP", html);

  return { otpSent: true };
}

export async function verifyOtp(email, otp) {
  const { data } = await supabase
    .from(OTP_TABLE)
    .select('*')
    .eq('email', email)
    .eq('otp', otp)
    .maybeSingle();

  if (!data) return { valid: false };

  return { valid: true };
}
