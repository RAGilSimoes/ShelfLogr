import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET!;

export const generateToken = (userId: number, email: string, name: string) => {
  const payload = { id: userId, email: email, name: name };

  return jwt.sign(payload, SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
};
