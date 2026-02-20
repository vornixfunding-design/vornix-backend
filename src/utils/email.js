import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTP(to, otp) {
  try {
    await resend.emails.send({
      from: "Vornix <no-reply@vornixfunding.com>",
      to,
      subject: "Your Vornix OTP Code",
      html: `<p>Your OTP is: <strong>${otp}</strong>. It expires in 5 minutes.</p>`
    });

    return { success: true };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error };
  }
}
