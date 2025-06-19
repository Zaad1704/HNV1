import { Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import auditService from '../services/auditService';
import { IUser } from '../models/User';
import mongoose from 'mongoose';

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

export const getOrganizationUsers = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    try {
        const users = await User.find({ organizationId: req.user.organizationId })
            .select('-password'); // Exclude password from results
        
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: req.user });
};

export const updateUserDetails = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { name, address, governmentIdUrl } = req.body;
        if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (name) user.name = name;
        if (address) user.address = address;
        if (governmentIdUrl) user.governmentIdUrl = governmentIdUrl;

        await user.save();
        
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({ success: true, data: userResponse });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || !req.user) {
        return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Incorrect current password' });
    
    user.password = newPassword;
    await user.save();
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const requestDataExport = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).send();
        const organization = await Organization.findById(req.user.organizationId);
        if (!organization) return res.status(404).json({ success: false, message: "Organization not found." });
        
        organization.dataManagement = { ...organization.dataManagement, dataExportRequestedAt: new Date() };
        await organization.save();
        
        auditService.recordAction(req.user._id as mongoose.Types.ObjectId, req.user.organizationId as mongoose.Types.ObjectId, 'DATA_EXPORT_REQUEST');
        res.status(200).json({ success: true, message: "Your data export request has been received." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const requestAccountDeletion = async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.user) return res.status(401).send();
        const organization = await Organization.findById(req.user.organizationId);
        if (!organization) return res.status(404).json({ success: false, message: "Organization not found." });
        
        organization.status = 'pending_deletion';
        organization.dataManagement = { ...organization.dataManagement, accountDeletionRequestedAt: new Date() };
        await organization.save();
        
        auditService.recordAction(req.user!._id as mongoose.Types.ObjectId, req.user!.organizationId as mongoose.Types.ObjectId, 'ACCOUNT_DELETION_REQUEST');
        res.status(200).json({ success: true, message: "Your account deletion request has been received." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update the branding for the user's organization
// @route   PUT /api/users/organization/branding
export const updateOrganizationBranding = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    const { companyName, companyLogoUrl, companyAddress } = req.body;

    try {
        const organization = await Organization.findById(req.user.organizationId);

        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }

        organization.branding = {
            companyName: companyName || organization.branding?.companyName,
            companyLogoUrl: companyLogoUrl || organization.branding?.companyLogoUrl,
            companyAddress: companyAddress || organization.branding?.companyAddress,
        };

        await organization.save();

        auditService.recordAction(req.user._id as mongoose.Types.ObjectId, req.user.organizationId as mongoose.Types.ObjectId, 'BRANDING_UPDATE');

        res.status(200).json({ success: true, data: organization.branding });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
