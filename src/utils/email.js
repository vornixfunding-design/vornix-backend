import nodemailer from 'nodemailer';

export const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.OTP_EMAIL,
    pass: process.env.OTP_EMAIL_APP_PASSWORD,
  },
});

export async function sendEmail(to, subject, html) {
  await mailer.sendMail({
    from: `"Vornix Funding" <${process.env.OTP_EMAIL}>`,
    to,
    subject,
    html,
  });
}
