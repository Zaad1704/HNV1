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

    // Allow access even without subscription for now
    if (!subscription) {
      console.log('No subscription found, allowing access');
      return next();
    }

    if (subscription.currentPeriodEndsAt && subscription.currentPeriodEndsAt < new Date()) {
      subscription.status = 'past_due';
      await subscription.save();
      console.log('Subscription expired, but allowing access');
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