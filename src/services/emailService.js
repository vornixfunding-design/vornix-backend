import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true, // use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 20000, // 20 seconds
});

export async function sendOtpEmail(email, otp) {
  console.log(`[EMAIL] Attempting to send OTP to ${email}`);
  const mailOptions = {
    from: `"Vornix" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Vornix OTP Code',
    text: `Your OTP code is: ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES} minutes.`,
    html: `<p>Your OTP code is: <strong>${otp}</strong></p><p>It expires in ${process.env.OTP_EXPIRY_MINUTES} minutes.</p>`,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP sent successfully: ${info.messageId}`);
  } catch (err) {
    console.error('[EMAIL] Error sending OTP:', err);
    throw err; // rethrow so controller knows it failed
  }
}
