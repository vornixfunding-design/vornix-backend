import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_SECURE,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
} = process.env;

const hasSmtpConfig = SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS;

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

export const sendOtpEmail = async ({ email, otp }) => {
  if (!transporter) {
    console.warn(`[DEV OTP] ${email}: ${otp}`);
    return;
  }

  await transporter.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to: email,
    subject: 'Your login OTP',
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  });
};

export default {
  sendOtpEmail,
};
