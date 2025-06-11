import { Request, Response } from 'express';
import User from '../models/User';

export const updateUserDetails = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(req.user!.id, { name }, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!.id).select('+password');
    if (!user || !(await user.matchPassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }
    user.password = newPassword;
    await user.save();
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// Add other controllers (superAdmin, payments, subscriptions, audit) here...
export const getPayments = async (req: Request, res: Response) => { /* ... */ };
export const getAuditLogs = async (req: Request, res: Response) => { /* ... */ };
export const createSubscription = async (req: Request, res: Response) => { /* ... */ };
export const cancelSubscription = async (req: Request, res: Response) => { /* ... */ };
export const handleTcoWebhook = async (req: Request, res: Response) => { /* ... */ };
export const getSiteContent = async (req: Request, res: Response) => { /* ... */ };
export const updateSiteContent = async (req: Request, res: Response) => { /* ... */ };
export const getAllUsers = async (req: Request, res: Response) => { /* ... */ };
export const getAllOrganizations = async (req: Request, res: Response) => { /* ... */ };
export const updateOrganizationSubscription = async (req: Request, res: Response) => { /* ... */ };
