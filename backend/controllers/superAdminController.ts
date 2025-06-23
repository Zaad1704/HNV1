import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User';
import Organization from '../models/Organization';
import Subscription from '../models/Subscription';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Plan from '../models/Plan';
import { addMonths, addYears, addWeeks, addDays } from 'date-fns';
import { Types } from 'mongoose';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const totalUsers = await User.countDocuments();
    const totalOrgs = await Organization.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    res.status(200).json({ success: true, data: { totalUsers, totalOrgs, activeSubscriptions } });
});

export const getAllOrganizations = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const organizations = await Organization.find({})
        .populate('owner', 'name email')
        .populate({
            path: 'subscription',
            populate: { path: 'planId', model: 'Plan' }
        });
    res.status(200).json({ success: true, data: organizations });
});

// ... and so on for the rest of the functions in this file, changing req: AuthenticatedRequest to req: Request
