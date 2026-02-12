import { loginUser, registerUser } from '../services/authService.js';

const validateCredentials = (email, password) => {
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    throw error;
  }
};

const handleAuthError = (error, res) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error.' : error.message;

  res.status(statusCode).json({ error: message });
};

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    validateCredentials(email, password);

    const result = await registerUser({ email, password });

    res.status(201).json(result);
  } catch (error) {
    handleAuthError(error, res);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    validateCredentials(email, password);

    const result = await loginUser({ email, password });

    res.status(200).json(result);
  } catch (error) {
    handleAuthError(error, res);
  }
};

export const getCurrentUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.status(200).json({
    id: req.user.sub,
    email: req.user.email
  });
};
