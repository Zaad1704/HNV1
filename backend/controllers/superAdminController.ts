import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

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
                _id
