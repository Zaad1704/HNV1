import { Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import auditService from '../services/auditService';
import { IUser } from '../models/User';
import mongoose from 'mongoose'; // FIX: Import mongoose to use Types.ObjectId

const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: req.user });
};

export const updateUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name || !req.user) return res.status(400).json({ success: false, message: 'Name is required' });
    const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true, runValidators: true }).select('-password');
    res.status(200).json({ success: true, data: user });
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
        auditService.recordAction(req.user._id as mongoose.Types.ObjectId, req.user.organizationId as mongoose.Types.ObjectId, 'DATA_EXPORT_REQUEST'); // FIX: Cast to ObjectId
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
        auditService.recordAction(req.user!._id as mongoose.Types.ObjectId, req.user!.organizationId as mongoose.Types.ObjectId, 'ACCOUNT_DELETION_REQUEST'); // FIX: Cast to ObjectId
        res.status(200).json({ success: true, message: "Your account deletion request has been received." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
