import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';

export const createSuperAdmin = async (req: Request, res: Response) => {
  const { secretKey } = req.body;

  // 1. Security Check: Ensure the secret key from the request matches the one in our environment
  if (!secretKey || secretKey !== process.env.SETUP_SECRET_KEY) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    // 2. Check if the admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@email.com' });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Super Admin user already exists.' });
    }

    // 3. Create the user if they don't exist
    const adminOrg = await Organization.create({ name: 'HNV Global Headquarters' });

    const superAdmin = await User.create({
      name: 'Super Administrator',
      email: 'admin@email.com',
      password: 'admin', // This will be hashed automatically by the model's pre-save hook
      role: 'Super Admin',
      organizationId: adminOrg._id,
    });
    
    adminOrg.owner = superAdmin._id;
    await adminOrg.save();

    res.status(201).json({ success: true, message: 'Super Admin created successfully!' });

  } catch (error: any) {
    console.error('Error creating Super Admin:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
