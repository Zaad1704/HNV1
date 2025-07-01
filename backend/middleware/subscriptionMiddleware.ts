import { Request, Response, NextFunction } from 'express';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

export const checkSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Skip for super admin and public routes
    if (req.user?.role === 'Super Admin' || req.user?.role === 'Super Moderator') {
      return next();
    }

    if (!req.user?.organizationId) {
      return res.status(403).json({
        success: false,
        message: 'No organization associated',
        code: 'NO_ORGANIZATION'
      });
    }

    const subscription = await Subscription.findOne({ 
      organizationId: req.user.organizationId 
    }).populate('planId');

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No subscription found',
        code: 'NO_SUBSCRIPTION',
        action: 'REDIRECT_TO_PRICING'
      });
    }

    // Check if trial expired
    if (subscription.status === 'trialing' && subscription.trialExpiresAt && new Date() > subscription.trialExpiresAt) {
      subscription.status = 'inactive';
      await subscription.save();
    }

    // Check if subscription expired
    if (subscription.status === 'inactive' || subscription.status === 'canceled' || subscription.status === 'past_due') {
      return res.status(403).json({
        success: false,
        message: 'Subscription expired or inactive',
        code: 'SUBSCRIPTION_EXPIRED',
        action: 'REDIRECT_TO_BILLING',
        subscriptionStatus: subscription.status
      });
    }

    // Add subscription info to request
    (req as any).subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    next();
  }
};

export const checkUsageLimits = (resource: 'properties' | 'tenants' | 'agents') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const subscription = (req as any).subscription;
      if (!subscription || !subscription.planId) {
        return next();
      }

      const plan = subscription.planId;
      let currentCount = 0;
      let limit = 0;

      switch (resource) {
        case 'properties':
          const Property = require('../models/Property');
          currentCount = await Property.countDocuments({ organizationId: req.user?.organizationId });
          limit = plan.limits?.maxProperties || 0;
          break;
        case 'tenants':
          const Tenant = require('../models/Tenant');
          currentCount = await Tenant.countDocuments({ organizationId: req.user?.organizationId });
          limit = plan.limits?.maxTenants || 0;
          break;
        case 'agents':
          const User = require('../models/User');
          currentCount = await User.countDocuments({ 
            organizationId: req.user?.organizationId,
            role: 'Agent'
          });
          limit = plan.limits?.maxAgents || 0;
          break;
      }

      if (currentCount >= limit) {
        return res.status(403).json({
          success: false,
          message: `${resource} limit reached`,
          code: 'USAGE_LIMIT_EXCEEDED',
          current: currentCount,
          limit: limit,
          action: 'UPGRADE_PLAN'
        });
      }

      next();
    } catch (error) {
      console.error('Usage limit check error:', error);
      next();
    }
  };
};