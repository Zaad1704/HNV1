// FIX: Removed the duplicate import line.
import { Request, Response, NextFunction } from "express";
import Subscription from "../models/Subscription";
// FIX: Corrected the function name based on previous error logs.
import { billingPlans, createSubscription2CO } from "../services/billingService";

// BEST PRACTICE: Define the shape of the request body.
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
    // This relies on your custom type definition for req.user to work.
    const orgId = req.user.orgId; 
    const subs = await Subscription.find({ orgId });
    res.json(subs);
  } catch (err) {
    next(err);
  }
}

// Start new subscription (mock)
export async function subscribe(req: Request<{}, {}, SubscribeBody>, res: Response, next: NextFunction) {
  try {
    const { planId } = req.body;
    // This relies on your custom type definition for req.user to work.
    const orgId = req.user.orgId;
    const userEmail = req.user.email;

    // FIX: Changed to use the correct imported
