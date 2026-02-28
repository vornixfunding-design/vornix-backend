import nodemailer from "nodemailer";

const brevoHost = process.env.BREVO_HOST || process.env.BREVO_SMTP_HOST;
const brevoPort = Number(process.env.BREVO_PORT || process.env.BREVO_SMTP_PORT || 587);
const brevoUser = process.env.BREVO_USER || process.env.BREVO_SMTP_LOGIN;
const brevoPass = process.env.BREVO_PASS || process.env.BREVO_SMTP_PASSWORD;

const hasBrevoConfig = Boolean(brevoHost) && Boolean(brevoUser) && Boolean(brevoPass);
const hasGmailConfig = Boolean(process.env.GMAIL_USER) && Boolean(process.env.GMAIL_PASS);

const createTransportOptions = () => {
  if (hasBrevoConfig) {
    return {
      host: brevoHost,
      port: brevoPort,
      secure: brevoPort === 465,
      auth: {
        user: brevoUser,
        pass: brevoPass,
      },
    };
  }

  if (hasGmailConfig) {
    return {
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    };
  }

  throw new Error(
    "Email transport is not configured. Set BREVO_HOST/BREVO_USER/BREVO_PASS (or BREVO_SMTP_HOST/BREVO_SMTP_LOGIN/BREVO_SMTP_PASSWORD) and optional BREVO_PORT/BREVO_SMTP_PORT, or configure GMAIL_USER/GMAIL_PASS.",
  );
};

export const transporter = nodemailer.createTransport(createTransportOptions());
