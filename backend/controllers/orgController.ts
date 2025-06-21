// backend/controllers/orgController.ts
import { Request, Response, NextFunction } from 'express';
import Organization, { IOrganization } from '../models/Organization';
import User from '../models/User';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';

export const getOrganizationDetails = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    try {
        const organization = await Organization.findById(req.user.organizationId)
            .populate('owner', 'name email') // Populate owner to get name and email
            .populate({
                path: 'subscription',
                model: 'Subscription',
                populate: {
                    path: 'planId',
                    model: 'Plan',
                    select: 'name price duration' // Select relevant plan details
                }
            });

        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        res.status(200).json({ success: true, data: organization });
    } catch (error) {
        console.error("Error fetching organization details:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ... (rest of the file remains the same)
