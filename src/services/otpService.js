import { supabase } from "../config/supabase.js";
import { transporter } from "../utils/email.js";

// Generate OTP (6-digit)
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
async function sendOTPEmail(to, otp) {
  await transporter.sendMail({
    from: process.env.OTP_FROM_EMAIL,
    to,
    subject: "Your Vornix OTP Code",
    text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
  });
}

// Store OTP in database
async function storeOTP(email, otp) {
  await supabase.from("otp_codes").insert({
    email,
    otp,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
}

// Exported function used in authController
export async function generateAndSendOTP(email) {
  const otp = generateOTP();

  await storeOTP(email, otp);
  await sendOTPEmail(email, otp);

  return otp;
}

// Verify OTP
export async function verifyOTP(email, otp) {
  const { data, error } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("email", email)
    .eq("otp", otp)
    .single();

  if (error || !data) return false;

  if (new Date(data.expires_at) < new Date()) return false;

  // Delete OTP after use
  await supabase.from("otp_codes").delete().eq("email", email);

  return true;
}
