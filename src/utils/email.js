import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to, subject, html) {
  try {
    const from = process.env.RESEND_FROM_EMAIL;

    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    return { success: true, result };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error };
  }
}
