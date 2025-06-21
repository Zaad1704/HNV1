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
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET not defined in environment variables');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: string };

    const user = await User.findById(decoded.id);

    if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    // --- CRITICAL FIX MODIFICATION HERE ---
    // Allow inactive/suspended users to access *specific* billing/resubscribe endpoints.
    // This allows the ResubscribePage to fetch necessary data from /api/billing.
    const path = req.path.toLowerCase();
    const isAllowedForInactiveUser = (
        path.startsWith('/api/billing') // Allows access to billing details for inactive users
    );

    // Block inactive or suspended users immediately, UNLESS they are accessing allowed routes.
    if (user.status && user.status !== 'active') {
        if (!isAllowedForInactiveUser) {
            return res.status(403).json({ message: `Your account is ${user.status}. Access denied.` });
        }
        // If it is an allowed route for inactive users, proceed to next middleware/route handler.
    }

    // For non-admin users, check their organization's subscription status.
    // Super Admins bypass subscription checks.
    if (user.organizationId && user.role !== 'Super Admin') {
        const subscription = await Subscription.findOne({ organizationId: user.organizationId });
        // Block access if subscription is not active and it's not a lifetime deal,
        // UNLESS they are accessing allowed routes.
        if (subscription && subscription.status !== 'active' && !subscription.isLifetime) {
            if (!isAllowedForInactiveUser) {
                return res.status(403).json({ message: 'Organization subscription is inactive. Please contact support.' });
            }
            // If it's an allowed route for inactive subscriptions, proceed.
        }
    }

    req.user = user.toObject() as any; 
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
