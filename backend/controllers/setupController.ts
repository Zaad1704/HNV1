// FILE: backend/controllers/setupController.ts
import { Request, Response } from 'express';
import UserSetup from '../models/User';
import OrganizationSetup from '../models/Organization';

export const createSuperAdmin = async (req: Request, res: Response) => {
  const { secretKey } = req.body;
  if (!secretKey || secretKey !== process.env.SETUP_SECRET_KEY) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
  try {
    if (await UserSetup.findOne({ email: 'admin@email.com' })) {
      return res.status(400).json({ success: false, message: 'Super Admin user already exists.' });
    }
    const adminOrg = new OrganizationSetup({ name: 'HNV Global Headquarters', owner: undefined });
    const superAdmin = new UserSetup({
      name: 'Super Administrator', email: 'admin@email.com', password: 'admin',
      role: 'Super Admin', organizationId: adminOrg._id,
    });
    adminOrg.owner = superAdmin._id;
    await adminOrg.save();
    await superAdmin.save();
    res.status(201).json({ success: true, message: 'Super Admin created successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
