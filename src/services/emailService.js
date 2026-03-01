import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: `"Vornix" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Vornix OTP Code',
    text: `Your OTP code is: ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES} minutes.`,
    html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>It expires in ${process.env.OTP_EXPIRY_MINUTES} minutes.</p>`,
  };
  await transporter.sendMail(mailOptions);
}
