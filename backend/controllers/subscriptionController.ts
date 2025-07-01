import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import subscriptionService from '../services/subscriptionService';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

export const getSubscriptionStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const organizationId = req.user!.organizationId.toString();
  
  const usageStats = await subscriptionService.getUsageStats(organizationId);
  
  res.json({
    success: true,
    data: usageStats
  });
});

export const upgradePlan = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { planId } = req.body;
  const organizationId = req.user!.organizationId.toString();
  
  const subscription = await subscriptionService.upgradePlan(organizationId, planId);
  
  res.json({
    success: true,
    data: subscription,
    message: 'Plan upgraded successfully'
  });
});

export const cancelSubscription = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const organizationId = req.user!.organizationId.toString();
  
  await subscriptionService.cancelSubscription(organizationId);
  
  res.json({
    success: true,
    message: 'Subscription canceled successfully'
  });
});

export const reactivateSubscription = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { planId } = req.body;
  const organizationId = req.user!.organizationId.toString();
  
  const subscription = await subscriptionService.reactivateSubscription(organizationId, planId);
  
  res.json({
    success: true,
    data: subscription,
    message: 'Subscription reactivated successfully'
  });
});

export const processPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { planId, paymentMethod } = req.body;
  const organizationId = req.user!.organizationId.toString();
  
  const result = await subscriptionService.processPayment(organizationId, planId, paymentMethod);
  
  res.json({
    success: true,
    data: result,
    message: 'Payment processed successfully'
  });
});

export const getAvailablePlans = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const plans = await Plan.find({ isPublic: true }).sort({ price: 1 });
  
  res.json({
    success: true,
    data: plans
  });
});

export const getBillingHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const organizationId = req.user!.organizationId.toString();
  
  // Mock billing history - integrate with payment processor
  const billingHistory = [
    {
      id: '1',
      date: new Date(),
      amount: 29.99,
      status: 'paid',
      plan: 'Professional',
      invoice: 'INV-001'
    }
  ];
  
  res.json({
    success: true,
    data: billingHistory
  });
});

export const createCheckoutSession = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { planId } = req.body;
  const organizationId = req.user!.organizationId.toString();
  
  const plan = await Plan.findById(planId);
  if (!plan) {
    res.status(404).json({
      success: false,
      message: 'Plan not found'
    });
    return;
  }
  
  // Create Stripe checkout session or similar
  const checkoutUrl = `${process.env.FRONTEND_URL}/checkout?plan=${planId}&org=${organizationId}`;
  
  res.json({
    success: true,
    data: {
      checkoutUrl,
      planId,
      amount: plan.price
    }
  });
});