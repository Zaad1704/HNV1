import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';
import { startOfMonth, subMonths } from 'date-fns';

// @desc    Create a new Super Moderator
// @route   POST /api/super-admin/moderators
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

        // FIX: Add guard clause and use _id
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const superAdmin = await User.findById(req.user._id);
        if (!superAdmin) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const moderator = await User.create({
            name,
            email,
            password,
            role: 'Super Moderator',
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

// ... (The rest of the functions in this file remain the same, as they don't have the specific reported errors. Only createModerator had the 'req.user?._id' issue).

// @desc    Get all Super Moderators
// @route   GET /api/super-admin/moderators
export const getModerators = async (req: Request, res: Response) => {
    try {
        const moderators = await User.find({ role: 'Super Moderator' }).select('-password');
        res.status(200).json({ success: true, data: moderators });
    } catch (error) {
        console.error("Error fetching moderators:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update a moderator's permissions or details
// @route   PUT /api/super-admin/moderators/:id
export const updateModerator = async (req: Request, res: Response) => {
    const { name, permissions } = req.body;
    try {
        const moderator = await User.findById(req.params.id);
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

// @desc    Update any user's status (e.g., suspend/reactivate)
// @route   PUT /api/super-admin/users/:id/status
export const updateUserStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    if (!status || !['active', 'suspended'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Valid status ("active" or "suspended") is required.' });
    }

    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        user.status = status;
        await user.save();
        
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({ success: true, data: userResponse });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get key statistics for the Super Admin dashboard
// @route   GET /api/super-admin/dashboard-stats
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalOrgs = await Organization.countDocuments();
        const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });

        res.status(200).json({ 
            success: true, 
            data: { totalUsers, totalOrgs, activeSubscriptions } 
        });
    } catch (error) {
        console.error("Error fetching admin dashboard stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all organizations on the platform
// @route   GET /api/super-admin/organizations
export const getAllOrganizations = async (req: Request, res: Response) => {
    try {
        const organizations = await Organization.find({})
            .populate('owner', 'name email')
            .populate({
                path: 'subscription',
                model: 'Subscription',
                populate: {
                    path: 'planId',
                    model: 'Plan',
                    select: 'name'
                }
            });
        
        const formattedOrgs = organizations.map((org: any) => ({
            id: org._id,
            name: org.name,
            owner: org.owner,
            plan: org.subscription?.planId?.name || 'N/A',
            userCount: org.members?.length || 0,
            status: org.subscription?.status || org.status,
            isLifetime: org.subscription?.isLifetime || false,
        }));

        res.status(200).json({ success: true, data: formattedOrgs });
    } catch (error) {
        console.error("Error fetching all organizations:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update an organization's subscription status by Super Admin
// @route   PUT /api/super-admin/organizations/:id/subscription
export const updateSubscriptionStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    try {
        const organization = await Organization.findById(req.params.id);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found.' });
        }

        const subscription = await Subscription.findById(organization.subscription);
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found for this organization.' });
        }
        
        subscription.status = status;
        await subscription.save();
        
        res.status(200).json({ success: true, data: subscription });
    } catch (error) {
        console.error("Error updating subscription status:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get user and organization sign-up data for the last 12 months
// @route   GET /api/super-admin/platform-growth
export const getPlatformGrowthData = async (req: Request, res: Response) => {
    try {
        const twelveMonthsAgo = subMonths(new Date(), 12);
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            { $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                count: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        const orgGrowth = await Organization.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            { $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                count: { $sum: 1 }
            }},
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);
        res.status(200).json({ success: true, data: { userGrowth, orgGrowth } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get distribution of active subscriptions across plans
// @route   GET /api/super-admin/plan-distribution
export const getPlanDistributionData = async (req: Request, res: Response) => {
    try {
        const distribution = await Subscription.aggregate([
            { $match: { status: 'active' } },
            { $group: {
                _id: '$planId',
                count: { $sum: 1 }
            }},
            { $lookup: {
                from: 'plans',
                localField: '_id',
                foreignField: '_id',
                as: 'planDetails'
            }},
            { $unwind: '$planDetails' },
            { $project: {
                name: '$planDetails.name',
                value: '$count'
            }}
        ]);
        res.status(200).json({ success: true, data: distribution });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all users on the platform
// @route   GET /api/super-admin/users
export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({}).populate('organizationId', 'name').select('-password');
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all billing data for all organizations
// @route   GET /api/super-admin/billing
export const getBillingData = async (req: Request, res: Response) => {
    try {
        const billingData = await Subscription.find({})
            .populate('organizationId', 'name')
            .populate('planId', 'name price');
        res.status(200).json({ success: true, data: billingData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};


// @desc    Grant lifetime access to an organization's subscription
// @route   PUT /api/super-admin/organizations/:id/grant-lifetime
export const grantLifetimeAccess = async (req: Request, res: Response) => {
    try {
        const organization = await Organization.findById(req.params.id);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        const subscription = await Subscription.findById(organization.subscription);
        if (!subscription) {
            return res.status(404).json({ success: false, message: 'Subscription not found for this organization.' });
        }

        subscription.isLifetime = true;
        subscription.status = 'active'; // Ensure the status is active
        subscription.currentPeriodEndsAt = undefined; // Lifetime subs don't expire
        
        await subscription.save();

        res.status(200).json({ success: true, data: subscription });

    } catch (error) {
        console.error("Error granting lifetime access:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
