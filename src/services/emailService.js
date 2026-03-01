import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
  OTP_EXPIRY_MINUTES = '10',
} = process.env;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export async function sendOtpEmail(email, otp) {
  const expiryMinutes = Number(OTP_EXPIRY_MINUTES);

  await transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to: email,
    subject: 'Your Vornix OTP Code',
    text: `Your OTP code is ${otp}. It will expire in ${expiryMinutes} minutes.`,
  });
}

export default {
  sendOtpEmail,
};
