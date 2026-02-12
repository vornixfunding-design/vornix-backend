import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';

const USERS_TABLE = 'users';
const SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = '7d';

const ensureJwtSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const error = new Error('Missing JWT_SECRET environment variable.');
    error.statusCode = 500;
    throw error;
  }

  return secret;
};

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const fetchUserByEmail = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .select('id, email, password_hash')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (error) {
    const dbError = new Error('Failed to fetch user.');
    dbError.statusCode = 500;
    dbError.details = error;
    throw dbError;
  }

  return data;
};

const signToken = (userId, email) => {
  const secret = ensureJwtSecret();

  return jwt.sign({ sub: userId, email }, secret, { expiresIn: TOKEN_EXPIRES_IN });
};

export const registerUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  const existingUser = await fetchUserByEmail(normalizedEmail);

  if (existingUser) {
    const error = new Error('User already exists.');
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { data, error } = await supabase
    .from(USERS_TABLE)
    .insert({ email: normalizedEmail, password_hash: passwordHash })
    .select('id, email')
    .single();

  if (error) {
    const dbError = new Error('Failed to create user.');
    dbError.statusCode = 500;
    dbError.details = error;
    throw dbError;
  }

  const token = signToken(data.id, data.email);

  return {
    user: data,
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await fetchUserByEmail(email);

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken(user.id, user.email);

  return {
    user: {
      id: user.id,
      email: user.email,
    },
    token,
  };
};
