import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';

export const createSuperAdmin = async (req: Request, res: Response) => {
    const { secretKey } = req.body;
    if (!secretKey || secretKey !== process.env.SETUP_SECRET_KEY) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const existingAdmin = await User.findOne({ email: 'admin@email.com' });
        if (existingAdmin) {
            return res.status(400).json({ success: false, message: 'Super Admin user already exists.' });
        }

        // FIX: Create the admin org without a subscription reference.
        const adminOrg = new Organization({ name: 'HNV Global Headquarters', members: [], status: 'active' });
        
        const superAdmin = new User({
            name: 'Super Administrator',
            email: 'admin@email.com',
            password: 'admin', // This should be changed immediately after first login
            role: 'Super Admin',
            organizationId: adminOrg._id,
        });

        adminOrg.owner = superAdmin._id;
        adminOrg.members.push(superAdmin._id);
        
        await adminOrg.save();
        await superAdmin.save();

        res.status(201).json({ success: true, message: 'Super Admin account created successfully!' });

    } catch (error: any) {
        console.error('Error creating Super Admin:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// ... createDefaultPlans function remains the same, but should be updated to use the new Plan model structure ...
export const createDefaultPlans = async (req: Request, res: Response) => {
    // ...
    const defaultPlans = [
      { 
        name: 'Free Trial', price: 0, duration: 'monthly', isPublic: false,
        features: ['1 Property', '5 Tenants', '1 User'],
        limits: { maxProperties: 1, maxTenants: 5, maxAgents: 1 }
      },
      // ... other plans
    ];
    await Plan.insertMany(defaultPlans);
    // ...
};
