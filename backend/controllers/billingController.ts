import { Request, Response } from 'express';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import subscriptionService from '../services/subscriptionService';

interface AuthRequest extends Request {
  user?: any;
}

export const getSubscriptionDetails = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const subscription = await Subscription.findOne({ 
      organizationId: req.user.organizationId 
    }).populate('planId');

    if (!subscription) {
      return res.status(200).json({ success: true, data: null });
    }

    res.status(200).json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  try {
    const { planId } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    // Mock checkout session for development
    const sessionId = `mock_session_${Date.now()}`;
    const redirectUrl = `${process.env.FRONTEND_URL}/payment-success?session_id=${sessionId}`;

    res.json({
      success: true,
      checkoutUrl: redirectUrl,
      sessionId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getBillingHistory = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const billingHistory = [
      { id: 1, date: '2024-01-01', amount: 99, status: 'paid', plan: 'Premium' },
      { id: 2, date: '2024-02-01', amount: 99, status: 'paid', plan: 'Premium' }
    ];

    res.status(200).json({ success: true, data: billingHistory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const subscribeToPlan = async (req: AuthRequest, res: Response) => {
  try {
    const { planId, isTrial = false } = req.body;
    
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    let subscription;
    if (isTrial) {
      subscription = await subscriptionService.createTrialSubscription(req.user.organizationId, planId);
    } else {
      subscription = await subscriptionService.activateSubscription(req.user.organizationId, planId);
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const reactivateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const subscription = await subscriptionService.reactivateSubscription(req.user.organizationId);
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const subscription = await subscriptionService.cancelSubscription(req.user.organizationId);
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getSubscriptionStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const status = await subscriptionService.getSubscriptionStatus(req.user.organizationId);
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};