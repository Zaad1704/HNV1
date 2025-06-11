import { Request, Response } from 'express';
import User from '../models/User';
import Organization from '../models/Organization';

/**
 * @desc    Create the initial Super Admin user. This route is intended for a one-time setup.
 * @route   POST /api/setup/create-super-admin
 * @access  Private (requires a secret key)
 */
export const createSuperAdmin = async (req: Request, res: Response) => {
  const { secretKey } = req.body;

  // 1. Security Check: The secret key from the request must match the one in your .env file.
  if (!secretKey || secretKey !== process.env.SETUP_SECRET_KEY) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    // 2. Check if a Super Admin already exists to prevent duplicates.
    const existingAdmin = await User.findOne({ email: 'admin@email.com' });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Super Admin user already exists.' });
    }

    // 3. Create a dedicated organization for administrative purposes.
    const adminOrg = new Organization({
        name: 'HNV Global Headquarters',
        members: [] // Initialize the members array
    });
    
    // 4. Create the Super Admin user. The password will be hashed automatically by the User model.
    const superAdmin = new User({
      name: 'Super Administrator',
      email: 'admin@email.com',
      password: 'admin',
      role: 'Super Admin',
      organizationId: adminOrg._id,
    });

    // 5. Link the organization to its owner and save both to the database.
    adminOrg.owner = superAdmin._id;
    adminOrg.members.push(superAdmin._id);
    
    await adminOrg.save();
    await superAdmin.save();

    res.status(201).json({ success: true, message: 'Super Admin account created successfully!' });

  } catch (error: any) {
    console.error('Error creating Super Admin:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
