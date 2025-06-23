// backend/controllers/orgController.ts
import { Request, Response, NextFunction } from 'express';
import Organization, { IOrganization } from '../models/Organization';
import User from '../models/User';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan';


export const getOrganizationDetails = async (req: AuthenticatedRequest, res: Response) => { // Changed to AuthenticatedRequest
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    try {
        const organization = await Organization.findById(req.user.organizationId)
            .populate('owner', 'name email')
            .populate({
                path: 'subscription',
                model: 'Subscription',
                populate: {
                    path: 'planId',
                    model: 'Plan',
                    select: 'name price duration'
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

export const listOrganizations = async (req: AuthenticatedRequest, res: Response) => { // Changed to AuthenticatedRequest
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
        const formattedOrgs = organizations.map(org => ({
            id: org._id,
            name: org.name,
            owner: org.owner ? { name: (org.owner as any).name, email: (org.owner as any).email } : null,
            plan: (org.subscription as any)?.planId?.name || 'N/A',
            status: org.status,
            nextBillingDate: (org.subscription as any)?.currentPeriodEndsAt || null,
            userCount: org.members.length
        }));
        res.status(200).json({ success: true, data: formattedOrgs });
    } catch (error) {
        console.error("Error listing organizations:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const setOrgStatus = async (req: AuthenticatedRequest, res: Response) => { // Changed to AuthenticatedRequest
    const { orgId, status } = req.body;
    if (!orgId || !status) {
        return res.status(400).json({ success: false, message: 'Organization ID and status are required.' });
    }
    try {
        const organization = await Organization.findByIdAndUpdate(orgId, { status }, { new: true });
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found.' });
        }
        res.status(200).json({ success: true, message: `Organization ${organization.name} status updated to ${organization.status}.`, data: organization });
    } catch (error) {
        console.error("Error setting organization status:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
