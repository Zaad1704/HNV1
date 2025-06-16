import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import Organization from '../models/Organization';
import auditService from '../services/auditService';

/**
 * @desc    Creates a checkout session for a user to purchase a plan.
 * @route   POST /api/billing/create-checkout-session
 * @access  Private
 */
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

        // --- 2Checkout Integration Logic (Simulated) ---
        // In a real application, you would use the 2Checkout SDK here to generate a real checkout URL.
        // We will simulate this process for now.
        console.log(`Simulating 2Checkout session for User ${user.id} and Plan ${plan.name}`);

        // These are the URLs 2Checkout would redirect to after a transaction.
        // We will build frontend pages for these routes in the next step.
        const successUrl = `https://hnv-1-frontend.onrender.com/payment-success?session_id=mock_session_${new Date().getTime()}`;
        const cancelUrl = `https://hnv-1-frontend.onrender.com/payment-cancel`;
        
        // This is the mock redirect URL we send back to the frontend.
        res.status(200).json({ success: true, redirectUrl: successUrl });

    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Handles incoming webhooks from the payment provider (e.g., 2Checkout).
 * @route   POST /api/billing/webhook
 * @access  Public
 */
export const handlePaymentWebhook = async (req: Request, res: Response) => {
    // In a production environment, you would first verify a signature from 2Checkout
    // to ensure the request is authentic and secure.
    const event = req.body;
    
    console.log('Webhook event received:', event.type);

    // This is a simulated webhook for a successful payment.
    if (event.type === 'payment.success') {
        const { organizationId, planId, userId } = event.data;

        try {
            const plan = await Plan.findById(planId);
            const organization = await Organization.findById(organizationId);

            if (!plan || !organization) {
                console.error(`Webhook Error: Plan or Organization not found. PlanID: ${planId}, OrgID: ${organizationId}`);
                return res.status(400).send('Webhook Error: Invalid data.');
            }
            
            // Calculate the new renewal date based on the plan's duration
            const newRenewalDate = new Date();
            if (plan.duration === 'monthly') {
                newRenewalDate.setMonth(newRenewalDate.getMonth() + 1);
            } else if (plan.duration === 'yearly') {
                newRenewalDate.setFullYear(newRenewalDate.getFullYear() + 1);
            }

            // Update the organization's subscription in the database
            await Subscription.findOneAndUpdate(
                { organizationId: organization._id },
                {
                    planId: plan._id,
                    status: 'active',
                    trialExpiresAt: undefined, // Clear trial expiration date
                    currentPeriodEndsAt: newRenewalDate,
                },
                { upsert: true } // Create a new subscription if one doesn't exist
            );
            
            // Log this important financial event
            auditService.recordAction(userId, organizationId, 'SUBSCRIPTION_ACTIVATED', { plan: plan.name });

            console.log(`Subscription for Org ID ${organizationId} successfully updated to plan: ${plan.name}.`);
        
        } catch (error) {
            console.error('Webhook processing error:', error);
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }
    }

    res.status(200).json({ received: true });
};
