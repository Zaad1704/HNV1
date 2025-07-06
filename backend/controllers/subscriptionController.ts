import { Request, Response } from 'express';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

interface AuthRequest extends Request {
  user?: any;
}

export const getStatus = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    
    // Super Admin bypass
    if (user?.role === 'Super Admin') {
      return res.status(200).json({
        success: true,
        data: {
          status: 'active',
          userStatus: 'active',
          requiresSubscription: false,
          dashboardOnly: false,
          planName: 'Super Admin'
        }
      });
    }

    if (!user?.organizationId) {
      return res.status(200).json({
        success: true,
        data: {
          status: 'inactive',
          userStatus: 'no_subscription',
          requiresSubscription: true,
          dashboardOnly: true
        }
      });
    }

    const subscription = await Subscription.findOne({
      organizationId: user.organizationId
    }).populate('planId');

    if (!subscription) {
      return res.status(200).json({
        success: true,
        data: {
          status: 'inactive',
          userStatus: 'no_subscription',
          requiresSubscription: true,
          dashboardOnly: true
        }
      });
    }

    // Check if subscription is expired
    const now = new Date();
    let userStatus = 'active';
    let dashboardOnly = false;
    let requiresSubscription = false;

    if (subscription.status === 'trialing' && subscription.trialExpiresAt && subscription.trialExpiresAt < now) {
      userStatus = 'trial_expired';
      dashboardOnly = true;
      requiresSubscription = true;
    } else if (['expired', 'cancelled', 'past_due'].includes(subscription.status)) {
      userStatus = subscription.status === 'expired' ? 'expired' : 'inactive';
      dashboardOnly = true;
      requiresSubscription = true;
    } else if (subscription.status === 'inactive') {
      userStatus = 'inactive';
      dashboardOnly = true;
      requiresSubscription = true;
    }

    const plan = subscription.planId as any;
    
    res.status(200).json({
      success: true,
      data: {
        status: subscription.status,
        userStatus,
        requiresSubscription,
        dashboardOnly,
        planName: plan?.name || 'Unknown',
        expiresAt: subscription.currentPeriodEndsAt,
        trialExpiresAt: subscription.trialExpiresAt
      }
    });
    
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};