import { Request, Response, NextFunction } from "express";
import Subscription from "../models/Subscription";
import { billingPlans, createSubscriptionMock } from "../services/billingService";
import { Request, Response, NextFunction } from 'express';

// List available plans
export async function getPlans(_req: Request, res: Response) {
  res.json(billingPlans);
}

// List billing history for current org
export async function getBillingHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const orgId = req.user.orgId;
    const subs = await Subscription.find({ orgId });
    res.json(subs);
  } catch (err) {
    next(err);
  }
}

// Start new subscription (mock)
export async function subscribe(req: Request, res: Response, next: NextFunction) {
  try {
    const { planId } = req.body;
    const orgId = req.user.orgId;
    const userEmail = req.user.email;

    const subData = await createSubscriptionMock(orgId, planId, userEmail);
    const sub = await Subscription.create({
      orgId,
      plan: subData.plan,
      status: subData.status,
      renewalDate: subData.renewalDate,
      externalId: subData.externalId,
    });

    res.json({ success: true, subscription: sub });
  } catch (err) {
    next(err);
  }
}
