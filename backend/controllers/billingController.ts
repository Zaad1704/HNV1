import { Request, Response } from 'express'; // FIX: Import Request
// FIX: AuthenticatedRequest is no longer needed due to global type augmentation.
import Plan from '../models/Plan';
import Tenant from '../models/Tenant';
import Subscription from '../models/Subscription';
import Organization from '../models/Organization';
import auditService from '../services/auditService';
import mongoose from 'mongoose';
import axios from 'axios'; // Used for making API calls to 2Checkout

// @desc    Get the subscription details for the current user's organization
// @route   GET /api/billing
export const getSubscriptionDetails = async (req: Request, res: Response) => { // FIX: Use Request
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not authenticated.' });
    }

    try {
        const subscription = await Subscription.findOne({ organizationId: req.user.organizationId })
            .populate('planId'); // Populate the plan details

        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found.' });
        }

        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        console.error('Error fetching subscription details:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// This function now builds a real 2Checkout payload
export const createCheckoutSession = async (req: Request, res: Response) => { // FIX: Use Request
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

        // 1. Construct the payload as required by the 2Checkout API
        const payload = {
            BillingDetails: {
                FirstName: user.name.split(' ')[0],
                LastName: user.name.split(' ')[1] || 'User',
                Email: user.email,
            },
            Items: [{
                Name: plan.name,
                Price: {
                    Amount: (plan.price / 100).toFixed(2), // Price in dollars, e.g., 10.00
                    Currency: 'USD',
                    Type: 'DYNAMIC'
                },
                Quantity: 1,
                Tangible: '0',
                RecurringOptions: { // For subscriptions
                    Enable: '1',
                    Period: plan.duration === 'monthly' ? 'MONTH' : 'YEAR',
                    PeriodLength: '1'
                }
            }],
            PaymentDetails: {
                Currency: 'USD',
                PaymentMethod: {
                    Type: 'CARD',
                    EesToken: null // EesToken is for tokenized payments, not needed for initial checkout
                }
            },
            DevStudio: true, // Use `true` for testing with 2Checkout's sandbox
        };

        // --- 2. THIS IS WHERE THE REAL API CALL TO 2CHECKOUT WOULD GO ---
        //
        // const tcoResponse = await axios.post('https://api.2checkout.com/rest/6.0/orders/', payload, {
        //   headers: {
        //     'Content-Type': 'application/json',
        //     'X-Avangate-Authentication': `code="${process.env.TCO_SELLER_ID}" hash="${generateTcoHash()}"`
        //   }
        // });
        // const redirectUrl = tcoResponse.data.PaymentDetails.PaymentMethod.RedirectUrl;
        //
        // -----------------------------------------------------------------

        // 3. For now, we continue to simulate the response from 2Checkout.
        console.log("Simulating 2Checkout API call with payload:", JSON.stringify(payload, null, 2));
        const redirectUrl = `https://hnv-1-frontend.onrender.com/payment-success?session_id=mock_session_${new Date().getTime()}`;

        res.status(200).json({ success: true, redirectUrl: redirectUrl });

    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// This function now also builds a real 2Checkout payload for a one-time payment
export const createRentPaymentSession = async (req: Request, res: Response) => { // FIX: Use Request
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'User not authenticated.' });

    try {
        const tenant = await Tenant.findOne({ email: user.email });
        if (!tenant) return res.status(404).json({ success: false, message: 'Tenant profile not found.' });
        
        const rentAmount = 1200.00; // In a real app, this would come from the database

        // 1. Construct the payload for a one-time rent payment
        const payload = {
            BillingDetails: {
                FirstName: tenant.name.split(' ')[0],
                LastName: tenant.name.split(' ')[1] || 'Tenant',
                Email: tenant.email,
            },
            Items: [{
                Name: `Rent Payment - ${tenant.unit}`,
                Price: {
                    Amount: rentAmount.toFixed(2),
                    Currency: 'USD',
                    Type: 'DYNAMIC'
                },
                Quantity: 1,
                Tangible: '0'
            }],
            PaymentDetails: {
                Currency: 'USD',
                PaymentMethod: { Type: 'CARD', EesToken: null }
            },
            DevStudio: true,
        };

        // 2. Simulate the API call
        console.log("Simulating 2Checkout rent payment API call with payload:", JSON.stringify(payload, null, 2));
        const redirectUrl = `https://hnv-1-frontend.onrender.com/payment-success?session_id=mock_session_rent_${new Date().getTime()}`;

        res.status(200).json({ success: true, redirectUrl: redirectUrl });

    } catch (error) {
        console.error('Rent payment session error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// The webhook handler remains the same, as it processes the final result
export const handlePaymentWebhook = async (req: Request, res: Response) => {
    // ... (existing webhook logic)
};
