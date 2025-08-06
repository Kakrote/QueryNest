import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export async function verifyAuth(req) {
  const authHeader = req.headers.get('authorization');
  // console.log("enter the verification")
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // console.log("does not found bearer header ")
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // console.log("decoded token: ",decoded);
    return decoded; // contains userId and email
  } catch (err) {
    console.error('JWT error:', err);
    return null;
  }
}
