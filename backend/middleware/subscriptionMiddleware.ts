import { Request, Response, NextFunction } from 'express';
import Subscription from '../models/Subscription';

export const checkSubscriptionStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.organizationId) {
      return next();
    }

    const subscription = await Subscription.findOne({
      organizationId: req.user.organizationId
    }).populate('planId');

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No subscription found',
        code: 'NO_SUBSCRIPTION',
        redirectTo: '/pricing'
      });
    }

    if (subscription.currentPeriodEndsAt && subscription.currentPeriodEndsAt < new Date()) {
      subscription.status = 'past_due';
      await subscription.save();
      
      return res.status(403).json({
        success: false,
        message: 'Subscription expired',
        code: 'SUBSCRIPTION_EXPIRED',
        redirectTo: '/billing'
      });
    }

    if (!['active', 'trialing'].includes(subscription.status)) {
      return res.status(403).json({
        success: false,
        message: 'Subscription inactive',
        code: `SUBSCRIPTION_${subscription.status.toUpperCase()}`,
        redirectTo: '/billing'
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    next();
  }
};

export const requireActiveSubscription = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.organizationId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const subscription = await Subscription.findOne({
      organizationId: req.user.organizationId
    });

    if (!subscription || subscription.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Active subscription required',
        code: 'SUBSCRIPTION_REQUIRED',
        redirectTo: '/pricing'
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};