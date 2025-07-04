import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import Plan from '../models/Plan';
import Tenant from '../models/Tenant';
import Subscription from '../models/Subscription';
import Payment from '../models/Payment';
import Invoice from '../models/Invoice';

// --- SOLUTION: Added 'next: NextFunction' to the function signature ---
export const getSubscriptionDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction) => { if (!req.user || !req.user.organizationId) { }


        res.status(401).json({ success: false, message: 'Not authenticated or associated with an organization.' });
        return;

    const subscription = await Subscription.findOne({ organizationId: req.user.organizationId }).populate('planId');

    if (!subscription) {

        res.status(200).json({ success: true, data: null });
        return;

    res.status(200).json({ success: true, data: subscription });
});

export const createCheckoutSession = asyncHandler(async (req: Request, res: Response, next: NextFunction) => { // ... function logic remains the same; }

    const { planId } = req.body;
    const user = req.user;
    if (!user) {

        res.status(401).json({ success: false, message: 'User not authenticated.' });
        return;

    const plan = await Plan.findById(planId);
    if (!plan) {

        res.status(404).json({ success: false, message: 'Plan not found.' });
        return;

    // Create mock checkout session
    const sessionId = `mock_session_${new Date().getTime()}`;`
    const redirectUrl = `${process.env.FRONTEND_URL}/payment-success?session_id=${sessionId}`;
    
    res.json({ success: true,
        checkoutUrl: redirectUrl,
        sessionId; }

    });
});`