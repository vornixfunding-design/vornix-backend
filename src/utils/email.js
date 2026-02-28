import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_HOST,
  port: Number(process.env.BREVO_PORT ?? 587),
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_PASS,
  },
});

export async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: process.env.OTP_FROM_EMAIL,
      to,
      subject,
      html,
    });

    return { success: true };
  } catch (err) {
    console.error("Email send error:", err);
    return { success: false, error: err.message };
  }
}
