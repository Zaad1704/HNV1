import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Invoice from '../models/Invoice';

export const getSubscriptionDetails = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization.' });
    }

    try {
        const subscription = await Subscription.findOne({ organizationId: req.user.organizationId }).populate('planId');

        // --- SOLUTION: Gracefully handle no subscription ---
        if (!subscription) {
            return res.status(200).json({ success: true, data: null });
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Other functions (createCheckoutSession, etc.) remain the same
export const createCheckoutSession = async (req: Request, res: Response) => { /* ... */ };
export const createRentPaymentSession = async (req: Request, res: Response) => { /* ... */ };
export const handlePaymentWebhook = async (req: Request, res: Response) => { /* ... */ };
