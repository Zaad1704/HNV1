// backend/controllers/billingController.ts

import { Request, Response } from 'express';
import Plan, { IPlan } from '../models/Plan';
import Tenant from '../models/Tenant';
import Subscription from '../models/Subscription';

export const getSubscriptionDetails = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }
    try {
        const subscription = await Subscription.findOne({ organizationId: req.user.organizationId })
            .populate('planId');
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found.' });
        }
        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
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

        const userName = user.name || 'Valued Customer';

        const payload = {
            BillingDetails: {
                FirstName: userName.split(' ')[0],
                LastName: userName.split(' ')[1] || 'User',
                Email: user.email,
            },
            Items: [{
                Name: plan.name,
                Price: { Amount: (plan.price / 100).toFixed(2), Currency: 'USD', Type: 'DYNAMIC' },
                Quantity: 1,
                Tangible: '0',
                RecurringOptions: { Enable: '1', Period: plan.duration === 'monthly' ? 'MONTH' : 'YEAR', PeriodLength: '1' }
            }],
            PaymentDetails: { Currency: 'USD', PaymentMethod: { Type: 'CARD', EesToken: null } },
            DevStudio: true,
        };
        console.log("Simulating 2Checkout API call with payload:", JSON.stringify(payload, null, 2));
        const redirectUrl = `https://hnv-1-frontend.onrender.com/payment-success?session_id=mock_session_${new Date().getTime()}`;
        res.status(200).json({ success: true, redirectUrl: redirectUrl });
    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// --- MODIFIED FUNCTION ---
// @desc    Create a checkout session for a one-time rent payment
// @route   POST /api/billing/create-rent-payment
export const createRentPaymentSession = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'User not authenticated.' });

    // NEW: Accept lineItems from the request body
    const { lineItems } = req.body; 

    try {
        const tenant = await Tenant.findOne({ email: user.email });
        if (!tenant) return res.status(404).json({ success: false, message: 'Tenant profile not found.' });
        
        const totalRentAmount = tenant.rentAmount || 1200.00; // Default or fetch from lease/invoice

        // Construct items for 2Checkout payload
        const paymentItems = lineItems && lineItems.length > 0 
            ? lineItems.map((item: { description: string; amount: number; }) => ({
                Name: item.description,
                Price: { Amount: item.amount.toFixed(2), Currency: 'USD', Type: 'DYNAMIC' },
                Quantity: 1,
                Tangible: '0'
            }))
            : [{
                Name: `Rent Payment - ${tenant.unit}`,
                Price: { Amount: totalRentAmount.toFixed(2), Currency: 'USD', Type: 'DYNAMIC' },
                Quantity: 1,
                Tangible: '0'
            }];

        const payload = {
            BillingDetails: {
                FirstName: tenant.name.split(' ')[0],
                LastName: tenant.name.split(' ')[1] || 'Tenant',
                Email: tenant.email,
            },
            Items: paymentItems, // Use the constructed payment items
            PaymentDetails: { Currency: 'USD', PaymentMethod: { Type: 'CARD', EesToken: null } },
            DevStudio: true,
            // You might pass additional metadata here that 2Checkout sends back via webhook
            // to link this payment to a specific invoice, tenant, or month.
            // e.g., ReturnURL: `${process.env.FRONTEND_URL}/payment-success?invoiceId=${invoice._id}`
        };

        console.log("Simulating 2Checkout rent payment API call with payload:", JSON.stringify(payload, null, 2));
        const redirectUrl = `https://hnv-1-frontend.onrender.com/payment-success?session_id=mock_session_rent_${new Date().getTime()}`;
        res.status(200).json({ success: true, redirectUrl: redirectUrl });

    } catch (error) {
        console.error('Rent payment session error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const handlePaymentWebhook = async (req: Request, res: Response) => {
    console.log('Webhook received:', req.body);
    // In a real application, you would verify the webhook signature,
    // process the payment confirmation, update subscription/payment status in your DB.
    res.status(200).send('Webhook processed');
};
