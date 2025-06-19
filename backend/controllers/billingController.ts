import { Request, Response } from 'express';
import Plan, { IPlan } from '../models/Plan'; // Import IPlan for type safety
import Tenant from '../models/Tenant';
import Subscription from '../models/Subscription';

// This function now builds a real 2Checkout payload
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
                    Amount: (plan.price / 100).toFixed(2), // Assuming price is in cents
                    Currency: 'USD',
                    Type: 'DYNAMIC'
                },
                Quantity: 1,
                Tangible: '0',
                RecurringOptions: { // For subscriptions
                    Enable: '1',
                    // This line is now valid because we added 'duration' to the Plan model
                    Period: plan.duration === 'monthly' ? 'MONTH' : 'YEAR', 
                    PeriodLength: '1'
                }
            }],
            PaymentDetails: {
                Currency: 'USD',
                PaymentMethod: {
                    Type: 'CARD',
                    EesToken: null
                }
            },
            DevStudio: true, // Use `true` for testing with 2Checkout's sandbox
        };

        // For now, we continue to simulate the response from 2Checkout.
        console.log("Simulating 2Checkout API call with payload:", JSON.stringify(payload, null, 2));
        const redirectUrl = `https://hnv-1-frontend.onrender.com/payment-success?session_id=mock_session_${new Date().getTime()}`;

        res.status(200).json({ success: true, redirectUrl: redirectUrl });

    } catch (error) {
        console.error('Checkout session error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// Other functions from your controller...
export const getSubscriptionDetails = async (req: Request, res: Response) => {
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

export const createRentPaymentSession = async (req: Request, res: Response) => {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'User not authenticated.' });

    try {
        const tenant = await Tenant.findOne({ email: user.email });
        if (!tenant) return res.status(404).json({ success: false, message: 'Tenant profile not found.' });
        
        const rentAmount = 1200.00; // In a real app, this would come from the database

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

        console.log("Simulating 2Checkout rent payment API call with payload:", JSON.stringify(payload, null, 2));
        const redirectUrl = `https://hnv-1-frontend.onrender.com/payment-success?session_id=mock_session_rent_${new Date().getTime()}`;

        res.status(200).json({ success: true, redirectUrl: redirectUrl });

    } catch (error) {
        console.error('Rent payment session error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
