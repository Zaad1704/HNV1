import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

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
      
      // Fetch permissions along with other user data
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
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

// --- MODIFIED AUTHORIZE FUNCTION ---
export const authorize = (...requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Super Admins have access to everything, regardless of permissions.
    if (req.user.role === 'Super Admin') {
      return next();
    }
    
    // For other roles like Super Moderator, check if they have at least one of the required permissions.
    const hasPermission = req.user.permissions.some(permission => requiredPermissions.includes(permission));

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: `User does not have the required permissions` });
    }
    
    next();
  };
};
