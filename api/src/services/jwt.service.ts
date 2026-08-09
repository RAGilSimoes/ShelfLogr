import jwt, { type VerifyOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const SECRET = process.env.JWT_SECRET!;

export const generateToken = (userId: number, email: string, name: string) => {
  const payload = { id: userId, email: email, name: name };

  return jwt.sign(payload, SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string, options?: VerifyOptions) => {
  try {
    return jwt.verify(token, SECRET, options);
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};
