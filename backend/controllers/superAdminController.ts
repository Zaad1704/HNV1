import { Request, Response } from 'express';
import SiteContent from '../models/SiteContent';
import User from '../models/User';
import Organization from '../models/Organization';
import auditService from '../services/auditService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

// ... (getSiteContent, updateSiteContent, getAllUsers, getAllOrganizations, updateOrganizationSubscription functions remain the same) ...

export const getSiteContent = async (req: Request, res: Response) => { /* ... */ };
export const updateSiteContent = async (req: Request, res: Response) => { /* ... */ };
export const getAllUsers = async (req: Request, res: Response) => { /* ... */ };
export const getAllOrganizations = async (req: Request, res: Response) => { /* ... */ };
export const updateOrganizationSubscription = async (req: AuthenticatedRequest, res: Response) => { /* ... */ };


/**
 * @desc    Get all organizations with their data management status
 * @route   GET /api/super-admin/data-management
 * @access  Private (Super Admin)
 */
export const getDataManagementRequests = async (req: Request, res: Response) => {
    try {
        const organizations = await Organization.find({})
            .populate('owner', 'name email')
            .select('name status dataManagement subscription'); // Select specific fields for this view

        res.status(200).json({
            success: true,
            data: organizations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
