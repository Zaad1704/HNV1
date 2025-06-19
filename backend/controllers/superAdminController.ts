import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

// --- Moderator & User Management Functions ---

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

        // Moderators are part of the primary HNV organization, same as the Super Admin
        const superAdmin = await User.findById(req.user?.id);
        if (!superAdmin) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        const moderator = await User.create({
            name,
            email,
            password, // Password will be hashed by the pre-save hook in the User model
            role: 'Super Moderator',
            permissions: permissions || [],
            organizationId: superAdmin.organizationId // Assign to the main admin organization
        });

        const moderatorResponse = moderator.toObject();
        delete moderatorResponse.password;

        res.status(201).json({ success: true, data: moderatorResponse });

    } catch (error) {
        console.error("Error creating moderator:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

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


// --- Existing Platform-Wide Stats & Management Functions ---

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
        }));

        res.status(200).json({ success: true, data: formattedOrgs });
    } catch (error) {
        console.error("Error fetching all organizations:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update an organization's status
// @route   PUT /api/super-admin/organizations/:id/status
export const updateOrganizationStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    try {
        const organization = await Organization.findById(req.params.id);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found.' });
        }
        
        organization.status = status;
        await organization.save();
        
        res.status(200).json({ success: true, data: organization });
    } catch (error) {
        console.error("Error updating organization status:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


// @desc    Get user and organization sign-up data for the last 12 months
// @route   GET /api/super-admin/platform-growth
export const getPlatformGrowthData = async (req: Request, res: Response) => {
    try {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const userData = await User.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            { $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                newUsers: { $sum: 1 }
            }},
        ]);

        const orgData = await Organization.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            { $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                newOrgs: { $sum: 1 }
            }},
        ]);

        const summary = Array.from({ length: 12 }).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const users = userData.find(u => u._id.year === year && u._id.month === month)?.newUsers || 0;
            const orgs = orgData.find(o => o._id.year === year && o._id.month === month)?.newOrgs || 0;
            
            return {
                name: `${monthNames[month - 1]} ${String(year
