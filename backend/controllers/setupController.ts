// backend/controllers/setupController.ts

import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import mongoose from 'mongoose'; // FIX: Import mongoose to use Types.ObjectId

/**
 * @desc    Create the initial Super Admin user. This route is intended for a one-time setup.
 * @route   POST /api/setup/create-super-admin
 * @access  Private (requires a secret key)
 */
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
        const adminOrg = new Organization({ name: 'HNV Global Headquarters', members: [] });
        const superAdmin = new User({
            name: 'Super Administrator',
            email: 'admin@email.com',
            password: 'admin',
            role: 'Super Admin',
            organizationId: adminOrg._id as mongoose.Types.ObjectId, // FIX: Cast to ObjectId
        });
        adminOrg.owner = superAdmin._id as mongoose.Types.ObjectId; // FIX: Cast to ObjectId
        adminOrg.members.push(superAdmin._id as mongoose.Types.ObjectId); // FIX: Cast to ObjectId
        await adminOrg.save();
        await superAdmin.save();
        res.status(201).json({ success: true, message: 'Super Admin account created successfully!' });
    } catch (error: any) {
        console.error('Error creating Super Admin:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

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
        const plansExist = await Plan.findOne({ name: 'Landlord Plan' });
        if (plansExist) {
            return res.status(400).json({ success: false, message: 'Default plans already exist.' });
        }

        const defaultPlans = [
            { name: 'Free Trial', price: 0, features: ['Manage 1 Property', 'Basic Tenant Screening', 'Online Rent Collection'], isPublic: true },
            { name: 'Landlord Plan', price: 1000, features: ['Up to 10 Properties', 'Full Tenant Screening', 'Expense Tracking', 'Email Support'], isPublic: true },
            { name: 'Agent Plan', price: 2500, features: ['Unlimited Properties', 'Advanced Reporting', 'Vendor Management', 'Priority Phone Support'], isPublic: true }
        ];

        await Plan.insertMany(defaultPlans);

        res.status(201).json({ success: true, message: 'Default subscription plans created successfully!' });

    } catch (error: any) {
        console.error('Error creating default plans:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
