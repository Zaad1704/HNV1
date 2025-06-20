import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';

// createSuperAdmin function remains the same...
export const createSuperAdmin = async (req: Request, res: Response) => { /* ... */ };

/**
 * @desc    Create the default subscription plans. This is a one-time setup.
 * @route   POST /api/setup/create-default-plans
 * @access  Private (requires a secret key)
 */
export const createDefaultPlans = async (req: Request, res: Response) => {
    const { secretKey } = req.body;
    if (!secretKey || secretKey !== process.env.SETUP_SECRET_KEY) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const plansExist = await Plan.countDocuments();
        if (plansExist > 0) {
            return res.status(400).json({ success: false, message: 'Default plans have already been created.' });
        }

        // FIX: We define the plans with all the required fields from our new Plan model.
        // We ensure the plans meant for the public pricing page have isPublic: true.
        const defaultPlans = [
            { 
                name: 'Free Trial',
                price: 0,
                duration: 'monthly',
                isPublic: true, // Show this on the pricing page
                features: ['1 Property', '5 Tenants', '1 User'],
                limits: { maxProperties: 1, maxTenants: 5, maxAgents: 1 }
            },
            { 
                name: 'Landlord Plan',
                price: 1000, // $10.00 in cents
                duration: 'monthly',
                isPublic: true,
                features: ['Up to 10 Properties', 'Full Tenant Screening', 'Expense Tracking', 'Email Support'],
                limits: { maxProperties: 10, maxTenants: 25, maxAgents: 2 }
            },
            { 
                name: 'Agent Plan',
                price: 2500, // $25.00 in cents
                duration: 'monthly',
                isPublic: true,
                features: ['Unlimited Properties', 'Advanced Reporting', 'Vendor Management', 'Priority Phone Support'],
                limits: { maxProperties: 1000, maxTenants: 1000, maxAgents: 10 }
            }
        ];

        await Plan.insertMany(defaultPlans);

        res.status(201).json({ success: true, message: 'Default subscription plans created successfully!' });

    } catch (error: any) {
        console.error('Error creating default plans:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
