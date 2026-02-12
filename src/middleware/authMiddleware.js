import jwt from 'jsonwebtoken';

const getTokenFromHeader = (authHeader = '') => {
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

export const verifyToken = (req, res, next) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({ error: 'Missing JWT_SECRET environment variable.' });
  }

  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required.' });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.user = payload;

    return next();
  } catch (_error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export default verifyToken;
