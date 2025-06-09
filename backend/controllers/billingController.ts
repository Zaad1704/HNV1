import { Request, Response, NextFunction } from "express";
import Subscription from "../models/Subscription";
import { billingPlans, createSubscription2CO } from "../services/billingService";

interface SubscribeBody {
  planId: string;
}

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

// Start new subscription
export async function subscribe(req: Request<{}, {}, SubscribeBody>, res: Response, next: NextFunction) {
  try {
    const { planId } = req.body;
    const orgId = req.user.orgId;
    const userEmail = req.user.email;

    // This now works because createSubscription2CO returns the data we need
    const subData = await createSubscription2CO(orgId, planId, userEmail);
    
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
