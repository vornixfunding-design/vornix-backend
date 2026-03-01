import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.AUTH_JWT_SECRET || 'dev-auth-secret';

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const payload = jwt.verify(token, JWT_SECRET);

    req.user = {
      email: payload.email,
    };

    return next();
  } catch (_error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export default authMiddleware;
