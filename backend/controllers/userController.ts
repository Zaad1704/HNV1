// FILE: backend/controllers/userController.ts
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

// Add other placeholder controllers from your project...
export const getBillingInfo = async (req: Request, res: Response) => res.json({ message: "Billing info" });
export const getOrgInfo = async (req: Request, res: Response) => res.json({ message: "Org info" });
export const getProperties = async (req: Request, res: Response) => res.json({ message: "Properties list" });
export const getCmsContent = async (req: Request, res: Response) => res.json({ message: "CMS content" });
export const inviteUser = async (req: Request, res: Response) => res.json({ message: "User invited" });

