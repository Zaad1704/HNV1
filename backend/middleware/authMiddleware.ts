// backend/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Subscription from '../models/Subscription';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not defined in environment variables');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    
    const user = await User.findById(decoded.id).lean();
    
    if (user) {
        // If user is part of an organization, check its subscription status
        if (user.organizationId && user.role !== 'Super Admin') { // Super Admins bypass this check
            const subscription = await Subscription.findOne({ organizationId: user.organizationId });
            // Block access if subscription is not active and not lifetime
            if (subscription && subscription.status !== 'active' && !subscription.isLifetime) {
                return res.status(403).json({ message: 'Subscription inactive. Please contact support.' });
            }
        }
        req.user = user as any;
    }
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    next();
  }
};
