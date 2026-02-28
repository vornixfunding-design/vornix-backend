import nodemailer from "nodemailer";

const brevoHost = process.env.BREVO_HOST || process.env.BREVO_SMTP_HOST;
const brevoPort = Number(process.env.BREVO_PORT || process.env.BREVO_SMTP_PORT || 587);
const brevoUser = process.env.BREVO_USER || process.env.BREVO_SMTP_LOGIN;
const brevoPass = process.env.BREVO_PASS || process.env.BREVO_SMTP_PASSWORD;

const hasBrevoConfig = Boolean(brevoHost) && Boolean(brevoUser) && Boolean(brevoPass);
const hasGmailConfig = Boolean(process.env.GMAIL_USER) && Boolean(process.env.GMAIL_PASS);

const baseTimeoutOptions = {
  connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
  greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
  socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 20000),
};

const createBrevoOptions = ({ port, secure }) => ({
  host: brevoHost,
  port,
  secure,
  requireTLS: !secure,
  auth: {
    user: brevoUser,
    pass: brevoPass,
  },
  ...baseTimeoutOptions,
});

const createTransportOptions = () => {
  if (hasBrevoConfig) {
    return createBrevoOptions({ port: brevoPort, secure: brevoPort === 465 });
  }

  if (hasGmailConfig) {
    return {
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      ...baseTimeoutOptions,
    };
  }

  throw new Error(
    "Email transport is not configured. Set BREVO_HOST/BREVO_USER/BREVO_PASS (or BREVO_SMTP_HOST/BREVO_SMTP_LOGIN/BREVO_SMTP_PASSWORD) and optional BREVO_PORT/BREVO_SMTP_PORT, or configure GMAIL_USER/GMAIL_PASS.",
  );
};

const BREVO_RETRYABLE_ERROR_CODES = ["ETIMEDOUT", "ESOCKET", "ECONNECTION"];

const createTransporter = (options) => nodemailer.createTransport(options || createTransportOptions());

export const transporter = createTransporter();

export async function sendEmail(mailOptions) {
  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    const isBrevoTimeout =
      hasBrevoConfig &&
      brevoPort !== 465 &&
      BREVO_RETRYABLE_ERROR_CODES.includes(error?.code);

    if (!isBrevoTimeout) {
      throw error;
    }

    const fallbackTransporter = createTransporter(createBrevoOptions({ port: 465, secure: true }));
    return fallbackTransporter.sendMail(mailOptions);
  }
}
