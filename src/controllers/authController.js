import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase";
import { generateOTP, verifyOTP } from "../services/otpService.js";

const USERS_TABLE = "users";
const SALT_ROUNDS = 10;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const signToken = (userId, email) =>
  jwt.sign({ sub: userId, email }, process.env.JWT_SECRET, { expiresIn: "7d" });

export async function register(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const { data: existingUser, error: existingError } = await supabase
      .from(USERS_TABLE)
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({ error: "Failed to check existing user" });
    }

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data: user, error: createError } = await supabase
      .from(USERS_TABLE)
      .insert({ email, password_hash: passwordHash })
      .select("id, email")
      .single();

    if (createError || !user) {
      return res.status(500).json({ error: "Failed to create user" });
    }

    await generateOTP(email);

    return res.status(201).json({
      message: "User registered. OTP sent to email.",
      user,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Register failed" });
  }
}

export async function verify(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();

    if (!email || !otp) {
      return res.status(400).json({ error: "email and otp are required" });
    }

    const isValid = await verifyOTP(email, otp);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    return res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "OTP verification failed" });
  }
}

export async function login(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const { data: user, error: fetchError } = await supabase
      .from(USERS_TABLE)
      .select("id, email, password_hash")
      .eq("email", email)
      .maybeSingle();

    if (fetchError || !user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user.id, user.email);

    return res.status(200).json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Login failed" });
  }
}

export async function sendOtp(req, res) {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    await generateOTP(email);

    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to send OTP" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const { data: user, error: userError } = await supabase
      .from(USERS_TABLE)
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userError) {
      return res.status(500).json({ error: "Failed to check user" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await generateOTP(email);

    return res.status(200).json({ success: true, message: "Password reset OTP sent" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to send reset OTP" });
  }
}

export async function resetPassword(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || "").trim();
    const newPassword = String(req.body.newPassword || "");

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "email, otp and newPassword are required" });
    }

    const isValid = await verifyOTP(email, otp);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    const { error: updateError } = await supabase
      .from(USERS_TABLE)
      .update({ password_hash: passwordHash })
      .eq("email", email);

    if (updateError) {
      return res.status(500).json({ error: "Failed to update password" });
    }

    return res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Reset password failed" });
  }
}

export async function upsertProfile(req, res) {
  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert({
        id: req.user.id,
        full_name: req.body.full_name,
        updated_at: new Date(),
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
