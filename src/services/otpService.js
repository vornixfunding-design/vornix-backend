import supabase from "../config/supabase.js";
import { sendEmail } from "../utils/email.js";

const OTP_EXPIRY_MINUTES = 10;

const createOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export async function generateOTP(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail) {
    return false;
  }

  const otp = createOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  const { error: insertError } = await supabase.from("otp_codes").insert({
    email: normalizedEmail,
    otp,
    expires_at: expiresAt,
  });

  if (insertError) {
    throw new Error(`Failed to store OTP: ${insertError.message}`);
  }

  await sendEmail({
    from: process.env.OTP_FROM_EMAIL || process.env.GMAIL_USER || process.env.BREVO_USER || process.env.BREVO_SMTP_LOGIN,
    to: normalizedEmail,
    subject: "Your Vornix OTP Code",
    text: `Your OTP code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
  });

  return true;
}

export async function verifyOTP(email, otp) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedOtp = String(otp || "").trim();

  if (!normalizedEmail || !normalizedOtp) {
    return false;
  }

  const { data, error } = await supabase
    .from("otp_codes")
    .select("id, expires_at")
    .eq("email", normalizedEmail)
    .eq("otp", normalizedOtp)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) {
    return false;
  }

  const isExpired = new Date(data.expires_at).getTime() < Date.now();

  if (isExpired) {
    await supabase.from("otp_codes").delete().eq("id", data.id);
    return false;
  }

  const { error: deleteError } = await supabase.from("otp_codes").delete().eq("id", data.id);

  if (deleteError) {
    throw new Error(`Failed to delete OTP after verification: ${deleteError.message}`);
  }

  return true;
}
