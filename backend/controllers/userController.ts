import { Response } from 'express';
import User, { IUser } from '../models/User';
import Organization from '../models/Organization';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import auditService from '../services/auditService';

// This helper function can be shared or defined where needed.
// It creates a JWT and sends it in the response.
const sendTokenResponse = (user: IUser, statusCode: number, res: Response) => {
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ success: true, token });
};

/**
 * @desc    Get profile for the currently logged-in user
 * @route   GET /api/users/profile
 * @access  Private
 */
export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: req.user });
};

/**
 * @desc    Update user details (e.g., name) for the currently logged-in user
 * @route   PUT /api/users/updatedetails
 * @access  Private
 */
export const updateUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user!.id, 
      { name }, 
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Update password for the currently logged-in user
 * @route   PUT /api/users/updatepassword
 * @access  Private
 */
export const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'Please provide both current and new passwords' });
    }

    const user = await User.findById(req.user!.id).select('+password');

    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    user.password = newPassword;
    await user.save();
    
    sendTokenResponse(user, 200, res);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * @desc    Request a data export for the user's organization
 * @route   POST /api/users/request-data-export
 * @access  Private
 */
export const requestDataExport = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const organization = await Organization.findById(req.user!.organizationId);
        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found." });
        }

        // In a real app, this would trigger a background job to compile data.
        // For now, we'll just update the database record.
        organization.dataManagement = {
            ...organization.dataManagement,
            dataExportRequestedAt: new Date(),
        };
        await organization.save();
        
        auditService.recordAction(req.user!._id, req.user!.organizationId, 'DATA_EXPORT_REQUEST', {});
        
        res.status(200).json({ success: true, message: "Your data export request has been received. You will receive an email with a download link within 24 hours." });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

/**
 * @desc    Request account deletion for the user's organization
 * @route   POST /api/users/request-account-deletion
 * @access  Private
 */
export const requestAccountDeletion = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const organization = await Organization.findById(req.user!.organizationId);
        if (!organization) {
            return res.status(404).json({ success: false, message: "Organization not found." });
        }

        // The Super Admin can control this permission. For now, we assume it's allowed.
        // if (organization.settings.allowAccountDeletion === false) {
        //     return res.status(403).json({ success: false, message: "Account deletion is disabled for your organization." });
        // }

        organization.status = 'pending_deletion';
        organization.dataManagement = {
            ...organization.dataManagement,
            accountDeletionRequestedAt: new Date(),
        };
        await organization.save();

        auditService.recordAction(req.user!._id, req.user!.organizationId, 'ACCOUNT_DELETION_REQUEST', {});
        
        res.status(200).json({ success: true, message: "Your account deletion request has been received. The account will be permanently deleted after a 14-day grace period." });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
