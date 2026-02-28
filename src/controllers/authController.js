import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import supabase from "../config/supabase.js";
import { generateOTP, verifyOTP } from "../services/otpService.js";

const USERS_TABLE = "users";
const SALT_ROUNDS = 10;

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export async function register(req, res) {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message || "Failed to register user" });
    }

    return res.status(201).json({
      message: "Registration successful. Check your email for verification/OTP if enabled.",
      user: data.user,
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

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error || !data?.user) {
      return res.status(400).json({ error: error?.message || "Invalid or expired OTP" });
    }

    return res.status(200).json({ success: true, message: "OTP verified", session: data.session });
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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data?.user) {
      return res.status(401).json({ error: error?.message || "Invalid email or password" });
    }

    return res.status(200).json({
      user: data.user,
      session: data.session,
      access_token: data.session?.access_token,
    });
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

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      return res.status(400).json({ error: error.message || "Failed to send OTP" });
    }

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

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return res.status(400).json({ error: error.message || "Failed to send reset email" });
    }

    return res.status(200).json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Failed to send reset email" });
  }
}

export async function resetPassword(req, res) {
  return res.status(501).json({
    error:
      "Password reset should be completed using Supabase recovery flow (email link + session).",
  });
}

export async function upsertProfile(req, res) {
  try {
    const userId = req.user?.id;
    const fullName = req.body?.full_name;

    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert({
        id: userId,
        full_name: fullName,
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
