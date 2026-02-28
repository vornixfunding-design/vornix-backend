import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";
import { generateAndSendOTP, verifyOTP } from "../services/otpService.js";

const USERS_TABLE = "users";
const SALT = 10;

const signToken = (id, email) =>
  jwt.sign({ sub: id, email }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: "Email required" });

    await generateAndSendOTP(email);
    return res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    return res.status(500).json({ error: "OTP failed", details: err.message });
  }
};

export const registerController = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    if (!email || !password || !otp)
      return res.status(400).json({ error: "Missing fields" });

    const valid = await verifyOTP(email, otp);
    if (!valid) return res.status(400).json({ error: "Invalid OTP" });

    const { data: existing } = await supabase
      .from(USERS_TABLE)
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (existing) return res.status(409).json({ error: "User exists" });

    const password_hash = await bcrypt.hash(password, SALT);

    const { data: user } = await supabase
      .from(USERS_TABLE)
      .insert({ email: email.toLowerCase(), password_hash })
      .select("id, email")
      .single();

    const token = signToken(user.id, user.email);

    return res.json({ user, token });
  } catch (err) {
    return res.status(500).json({ error: "Registration error", details: err.message });
  }
};

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user } = await supabase
      .from(USERS_TABLE)
      .select("id, email, password_hash")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (!user) return res.status(401).json({ error: "Invalid email or pass" });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or pass" });

    const token = signToken(user.id, user.email);
    return res.json({ user: { id: user.id, email: user.email }, token });
  } catch (err) {
    return res.status(500).json({ error: "Login failed", details: err.message });
  }
};

export const forgotPasswordController = async (req, res) => {
  const { email } = req.body;
  await generateAndSendOTP(email);
  return res.json({ success: true, message: "OTP sent for password reset" });
};

export const resetPasswordController = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const valid = await verifyOTP(email, otp);
  if (!valid) return res.status(400).json({ error: "Invalid OTP" });

  const password_hash = await bcrypt.hash(newPassword, SALT);

  await supabase
    .from(USERS_TABLE)
    .update({ password_hash })
    .eq("email", email.toLowerCase());

  return res.json({ success: true, message: "Password reset successful" });
};
