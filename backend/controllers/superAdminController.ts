// backend/controllers/superAdminController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import Plan from '../models/Plan';
import Subscription from '../models/Subscription';
import bcrypt from 'bcryptjs';

export const getDashboardStats = async (req: Request, res: Response) => {
    const totalUsers = await User.countDocuments();
    const totalOrgs = await Organization.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    res.status(200).json({ success: true, data: { totalUsers, totalOrgs, activeSubscriptions } });
};

export const getAllOrganizations = async (req: Request, res: Response) => {
    const organizations = await Organization.find().populate('owner', 'name email').populate({
        path: 'subscription',
        populate: { path: 'planId', model: 'Plan' }
    });
    res.status(200).json({ success: true, data: organizations });
};

export const updateSubscriptionStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    const sub = await Subscription.findOneAndUpdate({ organizationId: req.params.id }, { status }, { new: true });
    res.status(200).json({ success: true, data: sub });
};

export const grantLifetimeAccess = async (req: Request, res: Response) => {
    const sub = await Subscription.findOneAndUpdate(
        { organizationId: req.params.id }, 
        { isLifetime: true, status: 'active' }, 
        { new: true }
    );
    res.status(200).json({ success: true, data: sub });
};

export const getPlatformGrowthData = async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: [] }); // Placeholder
};

export const getPlanDistributionData = async (req: Request, res: Response) => {
    res.status(200).json({ success: true, data: [] }); // Placeholder
};

export const getAllUsers = async (req: Request, res: Response) => {
    const users = await User.find().populate('organizationId', 'name');
    res.status(200).json({ success: true, data: users });
};

export const getBillingData = async (req: Request, res: Response) => {
    const subscriptions = await Subscription.find().populate('organizationId', 'name').populate('planId', 'name');
    res.status(200).json({ success: true, data: subscriptions });
};

export const createModerator = async (req: Request, res: Response) => {
    const { name, email, password, permissions } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });
    
    const user = new User({ name, email, password, role: 'Super Moderator', permissions, status: 'active' });
    await user.save();
    res.status(201).json({ success: true, data: user });
};

export const getModerators = async (req: Request, res: Response) => {
    const moderators = await User.find({ role: { $in: ['Super Moderator', 'Super Admin'] } });
    res.status(200).json({ success: true, data: moderators });
};

export const updateModerator = async (req: Request, res: Response) => {
    const { name, permissions } = req.body;
    const moderator = await User.findByIdAndUpdate(req.params.id, { name, permissions }, { new: true });
    res.status(200).json({ success: true, data: moderator });
};

export const updateUserStatus = async (req: Request, res: Response) => {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.status(200).json({ success: true, data: user });
};
