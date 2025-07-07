import { Request, Response, NextFunction } from 'express';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

interface AuthenticatedRequest extends Request {
  user?: any;
  subscription?: any;
  dashboardOnly?: boolean;
}

export const checkSubscriptionStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.organizationId) {
      return next();
    }

    // Super Admin bypass
    if (req.user.role === 'Super Admin') {
      return next();
    }

    const subscription = await Subscription.findOne({
      organizationId: req.user.organizationId
    }).populate('planId');

    if (!subscription) {
      req.dashboardOnly = true;
      console.log('No subscription found, dashboard-only access');
      return next();
    }

    // Check if subscription is expired or inactive
    const now = new Date();
    
    // Check trial expiration
    if (subscription.status === 'trialing' && subscription.trialExpiresAt && subscription.trialExpiresAt < now) {
      subscription.status = 'expired';
      await subscription.save();
      req.dashboardOnly = true;
      console.log('Trial expired, dashboard-only access');
    } else if (subscription.currentPeriodEndsAt && subscription.currentPeriodEndsAt < now) {
      subscription.status = 'expired';
      await subscription.save();
      req.dashboardOnly = true;
      console.log('Subscription expired, dashboard-only access');
    } else if (['inactive', 'canceled', 'past_due', 'expired'].includes(subscription.status)) {
      req.dashboardOnly = true;
      console.log(`Subscription ${subscription.status}, dashboard-only access`);
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    next();
  }
};

export const requireActiveSubscription = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.organizationId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Super Admin bypass
    if (req.user.role === 'Super Admin') {
      return next();
    }

    const subscription = await Subscription.findOne({
      organizationId: req.user.organizationId
    }).populate('planId');

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'No subscription found. Please subscribe to access full features.',
        code: 'SUBSCRIPTION_REQUIRED',
        userStatus: 'no_subscription',
        dashboardOnly: true,
        redirectTo: '/pricing'
      });
    }

    const activeStatuses = ['active', 'trialing'];
    if (!activeStatuses.includes(subscription.status)) {
      return res.status(403).json({
        success: false,
        message: getSubscriptionMessage(subscription.status),
        code: 'SUBSCRIPTION_REQUIRED',
        userStatus: subscription.status,
        subscriptionStatus: subscription.status,
        dashboardOnly: true,
        redirectTo: '/pricing'
      });
    }

    // Check trial expiration
    if (subscription.status === 'trialing' && subscription.trialExpiresAt && new Date() > subscription.trialExpiresAt) {
      subscription.status = 'expired';
      await subscription.save();
      
      return res.status(403).json({
        success: false,
        message: 'Your trial period has expired. Please subscribe to continue using all features.',
        code: 'TRIAL_EXPIRED',
        userStatus: 'trial_expired',
        subscriptionStatus: 'expired',
        dashboardOnly: true,
        redirectTo: '/pricing'
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Allow dashboard access for inactive/expired users
export const allowDashboardAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Super Admin bypass
    if (req.user.role === 'Super Admin') {
      return next();
    }

    // Allow dashboard access but mark as limited
    req.dashboardOnly = true;
    next();
  } catch (error) {
    console.error('Dashboard access check error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const checkFeatureAccess = (feature: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Super Admin bypass
      if (req.user?.role === 'Super Admin') {
        return next();
      }

      const subscription = req.subscription;
      
      if (!subscription || !subscription.planId) {
        return res.status(403).json({
          success: false,
          message: `Feature '${feature}' requires an active subscription`,
          code: 'FEATURE_REQUIRES_SUBSCRIPTION',
          requiresUpgrade: true,
          dashboardOnly: true,
          redirectTo: '/pricing'
        });
      }

      const plan = subscription.planId as any;
      
      // Check if plan has the required feature
      if (!plan.features || !plan.features.includes(feature)) {
        return res.status(403).json({
          success: false,
          message: `Feature '${feature}' not available in your current plan`,
          code: 'FEATURE_NOT_AVAILABLE',
          requiresUpgrade: true,
          currentPlan: plan.name,
          redirectTo: '/pricing'
        });
      }

      next();
    } catch (error) {
      console.error('Feature access check error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
};

function getSubscriptionMessage(status: string): string {
  switch (status) {
    case 'expired':
      return 'Your subscription has expired. Please renew to access full features.';
    case 'cancelled':
      return 'Your subscription has been cancelled. Please resubscribe to access full features.';
    case 'inactive':
      return 'Your subscription is inactive. Please subscribe to access full features.';
    case 'past_due':
      return 'Your subscription payment is past due. Please update your payment method.';
    default:
      return 'Active subscription required to access this feature.';
  }
}