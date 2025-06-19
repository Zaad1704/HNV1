import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';

// Example: List all super admins
export const getSuperAdmins = async (req: Request, res: Response) => {
  try {
    const superAdmins = await User.find({ role: 'Super Admin' });
    res.status(200).json({ success: true, data: superAdmins });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Example: Remove a permission from a super admin
export const removeSuperAdminPermission = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'Super Admin') {
      return res.status(404).json({ success: false, message: 'Super Admin not found' });
    }
    // permissions is optional in IUser, assign undefined to remove all
    user.permissions = undefined;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Example: Delete a super admin (soft delete)
export const deleteSuperAdmin = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'Super Admin') {
      return res.status(404).json({ success: false, message: 'Super Admin not found' });
    }
    user.status = 'inactive';
    await user.save();
    res.status(200).json({ success: true, message: 'Super Admin deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Example: Remove organization from a super admin
export const removeOrganizationFromSuperAdmin = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'Super Admin') {
      return res.status(404).json({ success: false, message: 'Super Admin not found' });
    }
    user.organizationId = undefined;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export {
  getSuperAdmins,
  removeSuperAdminPermission,
  deleteSuperAdmin,
  removeOrganizationFromSuperAdmin
};
