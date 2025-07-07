import { Request, Response } from 'express';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

interface AuthRequest extends Request {
  user?: any;
}

export const getBillingInfo = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const subscription = await Subscription.findOne({ 
      organizationId: req.user.organizationId 
    }).populate('planId');

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'No subscription found' 
      });
    }

    const billingInfo = {
      subscription: {
        status: subscription.status,
        currentPeriodEndsAt: subscription.currentPeriodEndsAt,
        nextBillingDate: subscription.nextBillingDate,
        amount: subscription.amount,
        currency: subscription.currency,
        billingCycle: subscription.billingCycle,
        isLifetime: subscription.isLifetime,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      },
      plan: subscription.planId,
      paymentMethod: subscription.paymentMethod || 'Not set',
      lastPaymentDate: subscription.lastPaymentDate,
      failedPaymentAttempts: subscription.failedPaymentAttempts
    };

    res.json({ success: true, data: billingInfo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updatePaymentMethod = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment method is required' 
      });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { organizationId: req.user.organizationId },
      { paymentMethod },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    res.json({
      success: true,
      message: 'Payment method updated successfully',
      data: { paymentMethod: subscription.paymentMethod }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const changePlan = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan ID is required' 
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plan not found' 
      });
    }

    const subscription = await Subscription.findOne({ 
      organizationId: req.user.organizationId 
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    // Update subscription
    subscription.planId = planId as any;
    subscription.amount = plan.price;
    subscription.billingCycle = plan.billingCycle === 'one-time' ? 'monthly' : plan.billingCycle;
    subscription.status = 'active'; // Reactivate subscription
    subscription.lastPaymentDate = new Date();
    subscription.failedPaymentAttempts = 0;
    
    // Calculate billing dates
    const now = new Date();
    subscription.currentPeriodStartsAt = now;
    
    const nextBilling = new Date();
    const nextPeriodEnd = new Date();
    
    if (plan.billingCycle === 'monthly') {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
    } else if (plan.billingCycle === 'yearly') {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
      nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + 1);
    }
    
    subscription.nextBillingDate = nextBilling;
    subscription.currentPeriodEndsAt = nextPeriodEnd;
    subscription.cancelAtPeriodEnd = false;
    subscription.canceledAt = undefined;

    await subscription.save();
    
    // Update user status to active
    const User = (await import('../models/User')).default;
    await User.findByIdAndUpdate(req.user._id, { status: 'active' });

    const populatedSubscription = await Subscription.findById(subscription._id).populate('planId');
    
    res.json({
      success: true,
      message: 'Plan updated and subscription reactivated successfully',
      data: populatedSubscription
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const subscription = await Subscription.findOne({ 
      organizationId: req.user.organizationId 
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription will be cancelled at the end of current period',
      data: { cancelAtPeriodEnd: true }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};