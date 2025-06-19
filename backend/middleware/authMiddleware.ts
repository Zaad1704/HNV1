// backend/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    // Pass to next middleware if no token, let routes decide if it's required
    return next();
  }

  try {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not defined in environment variables');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    
    const user = await User.findById(decoded.id).lean(); // Use .lean() for a plain object directly
    
    if (user) {
        // Corrected: Assign the plain object to req.user
        req.user = user as any; // Cast to any to satisfy the complex type, lean() makes it compatible
    }
    
    next();
  } catch (error) {
    // If token is invalid or expired, just move on without a user
    console.error('Token verification failed:', error);
    next();
  }
};
