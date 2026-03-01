const OTP_LENGTH = 6;
const OTP_TTL_MS = 10 * 60 * 1000;

const otpStore = new Map();

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const buildOtp = () =>
  Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10)).join('');

export const generateOTP = (email) => {
  const normalizedEmail = normalizeEmail(email);
  const otp = buildOtp();

  otpStore.set(normalizedEmail, {
    otp,
    expiresAt: Date.now() + OTP_TTL_MS,
  });

  return otp;
};

export const verifyOTP = (email, otp) => {
  const normalizedEmail = normalizeEmail(email);
  const entry = otpStore.get(normalizedEmail);

  if (!entry) {
    return false;
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalizedEmail);
    return false;
  }

  const isValid = entry.otp === String(otp || '').trim();

  if (isValid) {
    otpStore.delete(normalizedEmail);
  }

  return isValid;
};

export default {
  generateOTP,
  verifyOTP,
};
