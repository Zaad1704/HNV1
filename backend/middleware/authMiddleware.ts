import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { Document } from 'mongoose';

export interface AuthenticatedRequest extends Request {
  user?: (IUser & Document<any, any, any>) | null;
}

export const protect = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not defined');
      }
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
      req.user = (await User.findById(decoded.id).select('-password')) as (IUser & Document<any, any, any>) | null;
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }
      if (req.user.status === 'suspended' || req.user.status === 'pending') {
        return res.status(401).json({ success: false, message: 'User account is not active.' });
      }
      next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `User role ${req.user?.role} is not authorized` });
    }
    next();
  };
};
