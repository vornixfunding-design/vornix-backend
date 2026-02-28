import supabase from "../config/supabase.js";
import { sendEmail } from "../utils/email.js";

export async function generateAndSendOTP(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  // Store OTP
  await supabase.from("otp_codes").insert({
    email: email.toLowerCase(),
    otp,
    expires_at,
  });

  // Send OTP via email
  const html = `
    <p>Your Vornix verification code:</p>
    <h2 style="font-size: 28px;">${otp}</h2>
    <p>This code will expire in 10 minutes.</p>
  `;

  const result = await sendEmail(email, "Your Vornix OTP Code", html);

  if (!result.success) throw new Error("Failed to send OTP");
  return true;
}

export async function verifyOTP(email, otp) {
  const now = new Date().toISOString();

  const { data } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("email", email.toLowerCase())
    .eq("otp", otp)
    .gt("expires_at", now)
    .maybeSingle();

  if (!data) return false;

  // Delete OTP after use
  await supabase.from("otp_codes").delete().eq("id", data.id);

  return true;
}
