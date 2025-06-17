import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import Organization from '../models/Organization';
import auditService from '../services/auditService';
import mongoose from 'mongoose'; // <-- I've added this import for ObjectId casting

export const createCheckoutSession = async (req: AuthenticatedRequest, res: Response) => {
    const { planId } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    try {
        const plan = await Plan.findById(planId);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found.' });
        }

        console.log(`Simulating 2Checkout session for User ${user.id} and Plan ${plan.name}`);

        const successUrl = `https://hnv-1-frontend.onrender.com/payment-success?session_id=mock_session_${new Date().getTime()}`;
        const cancelUrl = `https://hnv-1-frontend.onrender.com/payment-cancel`;
        
        res.status(200).json({ success: true, redirectUrl: successUrl });

    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const handlePaymentWebhook = async (req: Request, res: Response) => {
    const event = req.body;
    
    console.log('Webhook event received:', event.type);

    if (event.type === 'payment.success') {
        const { organizationId, planId, userId } = event.data;

        try {
            const plan = await Plan.findById(planId);
            const organization = await Organization.findById(organizationId);

            if (!plan || !organization) {
                console.error(`Webhook Error: Plan or Organization not found. PlanID: ${planId}, OrgID: ${organizationId}`);
                return res.status(400).send('Webhook Error: Invalid data.');
            }
            
            const newRenewalDate = new Date();
            if (plan.duration === 'monthly') {
                newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
            } else if (plan.duration === 'yearly') {
                newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
            }

            await Subscription.findOneAndUpdate(
                { organizationId: organization._id },
                {
                    planId: plan._id,
                    status: 'active',
                    trialExpiresAt: undefined,
                    currentPeriodEndsAt: newRenewalDate,
                },
                { upsert: true }
            );
            
            // Log this important financial event
            const userObjectId = new mongoose.Types.ObjectId(userId);
            const orgObjectId = new mongoose.Types.ObjectId(organizationId);
            auditService.recordAction(userObjectId, orgObjectId, 'SUBSCRIPTION_ACTIVATED', { plan: plan.name });

            console.log(`Subscription for Org ID ${organizationId} successfully updated to plan: ${plan.name}.`);
        
        } catch (error: any) { // FIX: Added ': any' to properly type the caught error
            console.error('Webhook processing error:', error);
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }
    }

    res.status(200).json({ received: true });
};
