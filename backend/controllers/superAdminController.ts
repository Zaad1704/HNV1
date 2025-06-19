import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

// --- Moderator & User Management Functions ---

export const createModerator = async (req: Request, res: Response) => {
    const { name, email, password, permissions } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User with that email already exists.' });
        }

        const superAdmin = await User.findById(req.user?.id);
        if (!superAdmin) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const moderator = await User.create({
            name,
            email,
            password,
            role: 'Super Moderator', // This role is now valid in the User model
            permissions: permissions || [],
            organizationId: superAdmin.organizationId
        });

        const moderatorResponse = moderator.toObject();
        delete moderatorResponse.password;

        res.status(201).json({ success: true, data: moderatorResponse });

    } catch (error) {
        console.error("Error creating moderator:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getModerators = async (req: Request, res: Response) => {
    try {
        const moderators = await User.find({ role: 'Super Moderator' }).select('-password');
        res.status(200).json({ success: true, data: moderators });
    } catch (error) {
        console.error("Error fetching moderators:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateModerator = async (req: Request, res: Response) => {
    const { name, permissions } = req.body;
    try {
        const moderator = await User.findById(req.params.id);
        // This comparison is now valid because 'Super Moderator' is in the IUser role enum
        if (!moderator || moderator.role !== 'Super Moderator') {
            return res.status(404).json({ success: false, message: 'Moderator not found' });
        }

        moderator.name = name || moderator.name;
        if (permissions) {
            moderator.permissions = permissions;
        }

        await moderator.save();
        const moderatorResponse = moderator.toObject();
        delete moderatorResponse.password;

        res.status(200).json({ success: true, data: moderatorResponse });

    } catch (error) {
        console.error("Error updating moderator:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const updateUserStatus = async (req: Request, res: Response) => {
    // ... (rest of the functions remain the same)
};

export const getDashboardStats = async (req: Request, res: Response) => {
    // ...
};

export const getAllOrganizations = async (req: Request, res: Response) => {
    // ...
};

export const updateSubscriptionStatus = async (req: Request, res: Response) => {
    // ...
};

export const getPlatformGrowthData = async (req: Request, res: Response) => {
    // ...
};

export const getPlanDistributionData = async (req: Request, res: Response) => {
    // ...
};

export const getAllUsers = async (req: Request, res: Response) => {
    // ...
};

export const getBillingData = async (req: Request, res: Response) => {
    // ...
};

export const grantLifetimeAccess = async (req: Request, res: Response) => {
    // ...
};
