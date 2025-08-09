import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Verifies Bearer token and returns decoded payload { userId, email } or null.
export async function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    if (!JWT_SECRET) return null; // Misconfiguration safeguard
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // Intentionally minimal logging to avoid noise; could integrate structured logger
    return null;
  }
}
