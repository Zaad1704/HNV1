// backend/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Subscription from '../models/Subscription'; // Make sure Subscription model is imported

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If there's no token, and a route is protected, it will fail later. 
  // For now, we just won't attach a user.
  if (!token) {
    return next();
  }

  try {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not defined in environment variables');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    
    // Fetch the user from the database.
    const user = await User.findById(decoded.id); // Not using .lean() to check status on the full document
    
    if (user) {
        // --- CRITICAL FIX ---
        // Block inactive or suspended users immediately.
        if (user.status && user.status !== 'active') {
            return res.status(403).json({ message: `Your account is ${user.status}. Access denied.` });
        }

        // For non-admin users, check their organization's subscription status.
        if (user.organizationId && user.role !== 'Super Admin') {
            const subscription = await Subscription.findOne({ organizationId: user.organizationId });
            // Block access if subscription is not active and it's not a lifetime deal
            if (subscription && subscription.status !== 'active' && !subscription.isLifetime) {
                return res.status(403).json({ message: 'Organization subscription is inactive. Please contact support.' });
            }
        }
        // Attach the lean object for performance in subsequent operations
        req.user = user.toObject() as any; 
    }
    
    next();
  } catch (error) {
    // This will catch expired tokens etc.
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
