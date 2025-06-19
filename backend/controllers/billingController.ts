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

        // Corrected: Provide fallback for optional user.name
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

export const createRentPaymentSession = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'User not authenticated.' });
    try {
        const tenant = await Tenant.findOne({ email: user.email });
        if (!tenant) return res.status(404).json({ success: false, message: 'Tenant profile not found.' });
        const rentAmount = tenant.rentAmount || 1200.00; // Use actual rent amount
        const payload = {
            BillingDetails: {
                FirstName: tenant.name.split(' ')[0],
                LastName: tenant.name.split(' ')[1] || 'Tenant',
                Email: tenant.email,
            },
            Items: [{
                Name: `Rent Payment - ${tenant.unit}`,
                Price: { Amount: rentAmount.toFixed(2), Currency: 'USD', Type: 'DYNAMIC' },
                Quantity: 1,
                Tangible: '0'
            }],
            PaymentDetails: { Currency: 'USD', PaymentMethod: { Type: 'CARD', EesToken: null } },
            DevStudio: true,
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
    res.status(200).send('Webhook processed');
};
