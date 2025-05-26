import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // contains userId and email
  } catch (err) {
    console.error('JWT error:', err);
    return null;
  }
}
