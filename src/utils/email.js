import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendEmail({ to, subject, html }) {
  return transporter.sendMail({
    from: `"Vornix Funding" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
