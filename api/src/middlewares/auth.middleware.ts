import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwt.service.js';

export const verifyAuthorization = (ignoreExpiration: boolean) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid Token' });
    }

    const token = authHeader.split(' ')[1]!;

    const verifyOptions = {
      ignoreExpiration,
    };

    const verifiedToken: any = verifyToken(token, verifyOptions);

    if (verifiedToken == null) {
      return res.status(401).json({ error: 'Invalid Token' });
    }

    req.token = verifiedToken;
    next();
  };
};
