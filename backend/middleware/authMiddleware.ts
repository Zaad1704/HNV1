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
    // If no token, return 401 if route is meant to be protected.
    // For unprotected routes, next() would handle it.
    // Given the context this middleware is used, usually means a protected route.
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not defined in environment variables');
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };
    
    // Fetch the user from the database.
    const user = await User.findById(decoded.id);
    
    if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // --- CRITICAL FIX MODIFICATION HERE ---
    // Allow inactive/suspended users to access *specific* billing/resubscribe endpoints
    // This allows the ResubscribePage to fetch necessary data.
    const isBillingOrResubscribeRoute = req.path.startsWith('/billing') || req.path.startsWith('/resubscribe'); // Added check for path

    if (user.status && user.status !== 'active') {
        if (!isBillingOrResubscribeRoute) {
            return res.status(403).json({ message: `Your account is ${user.status}. Access denied.` });
        }
        // If it is a billing/resubscribe route, allow them to pass the user check,
        // so they can fetch their billing info to reactivate.
    }

    // For non-admin users, check their organization's subscription status.
    // Super Admins bypass subscription checks.
    if (user.organizationId && user.role !== 'Super Admin') {
        const subscription = await Subscription.findOne({ organizationId: user.organizationId });
        // Block access if subscription is not active and it's not a lifetime deal
        if (subscription && subscription.status !== 'active' && !subscription.isLifetime) {
            if (!isBillingOrResubscribeRoute) {
                return res.status(403).json({ message: 'Organization subscription is inactive. Please contact support.' });
            }
            // If it's a billing/resubscribe route, allow them to proceed.
        }
    }

    // Attach the lean object for performance in subsequent operations
    req.user = user.toObject() as any; 
    next();
  } catch (error) {
    // This will catch expired tokens etc.
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
