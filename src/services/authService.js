import supabase from '../config/supabase.js';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

export const registerUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
  });

  if (error) {
    const authError = new Error(error.message || 'Failed to register user.');
    authError.statusCode = 400;
    throw authError;
  }

  return {
    user: data.user,
    session: data.session,
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });

  if (error || !data?.user) {
    const authError = new Error(error?.message || 'Invalid email or password.');
    authError.statusCode = 401;
    throw authError;
  }

  return {
    user: data.user,
    session: data.session,
  };
};
