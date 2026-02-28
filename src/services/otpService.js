// src/services/otpService.js
import nodemailer from "nodemailer";
import { supabase } from "../config/supabase.js";

export function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
}

export async function sendOTPEmail(email, otp) {
  const transporter = nodemailer.createTransport({
    host: process.env.BREVO_HOST,
    port: Number(process.env.BREVO_PORT),
    secure: false,
    auth: {
      user: process.env.BREVO_USERNAME,
      pass: process.env.BREVO_PASSWORD,
    },
  });

  const mailData = {
    from: process.env.BREVO_FROM_EMAIL,
    to: email,
    subject: "Your Vornix OTP Code",
    text: `Your OTP is: ${otp}`,
    html: `<p>Your OTP code is:</p><h2>${otp}</h2>`,
  };

  return transporter.sendMail(mailData);
}

export async function saveOTP(email, otp) {
  await supabase.from("auth_otp").insert({
    email,
    otp,
    created_at: new Date().toISOString(),
  });
}

export async function verifyOTP(email, otp) {
  const { data, error } = await supabase
    .from("auth_otp")
    .select("*")
    .eq("email", email)
    .eq("otp", otp)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || data.length === 0) return false;

  return true;
}
