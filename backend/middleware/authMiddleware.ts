import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User'; // Import IUser

// FIX: Ensure AuthenticatedRequest is exported and user property is correctly typed with IUser
export interface AuthenticatedRequest extends Request {
  user?: IUser;
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
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }
      // FIX: Check user status, as indicated by previous errors
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
    // FIX: Ensure req.user and req.user.role are correctly accessed
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `User role ${req.user?.role} is not authorized` });
    }
    next();
  };
};
