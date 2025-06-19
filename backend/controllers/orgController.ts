import { Request, Response, NextFunction } from 'express';
// FIX: AuthenticatedRequest is no longer needed.
import Organization, { IOrganization } from '../models/Organization';
import User from '../models/User';
import Subscription from '../models/Subscription';
import Plan from '../models/Plan'; // Assuming Plan model is needed for subscription details

export const getOrganizationDetails = async (req: Request, res: Response) => { // FIX: Use Request
    // Logic to get details for the user's organization
    res.status(200).json({ name: "My Organization", owner: "Current User" });
};

// FIX: Added placeholder for listOrganizations
export const listOrganizations = async (req: Request, res: Response) => {
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
        // Format the output to match frontend's expected structure if necessary
        const formattedOrgs = organizations.map(org => ({
            id: org._id,
            name: org.name,
            owner: org.owner ? { name: (org.owner as any).name, email: (org.owner as any).email } : null,
            plan: (org.subscription as any)?.planId?.name || 'N/A', // Access plan name
            status: org.status,
            nextBillingDate: (org.subscription as any)?.currentPeriodEndsAt || null, // Assuming this field exists for billing
            userCount: org.members.length // Count members
        }));
        res.status(200).json({ success: true, data: formattedOrgs });
    } catch (error) {
        console.error("Error listing organizations:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// FIX: Added placeholder for setOrgStatus
export const setOrgStatus = async (req: Request, res: Response) => {
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
