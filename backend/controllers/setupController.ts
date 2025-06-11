// FILE: backend/controllers/setupController.ts
import { Request, Response } from 'express';
// Re-importing models here for clarity
import UserSetup from '../models/User';
import OrganizationSetup from '../models/Organization';

export const createSuperAdmin = async (req: Request, res: Response) => {
  const { secretKey } = req.body;

  if (!secretKey || secretKey !== process.env.SETUP_SECRET_KEY) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const existingAdmin = await UserSetup.findOne({ email: 'admin@email.com' });
    if (existingAdmin) {
      return res.status(400).json({ success: false, message: 'Super Admin user already exists.' });
    }

    const adminOrg = new OrganizationSetup({ name: 'HNV Global Headquarters' });
    
    const superAdmin = new UserSetup({
      name: 'Super Administrator',
      email: 'admin@email.com',
      password: 'admin',
      role: 'Super Admin',
      organizationId: adminOrg._id,
    });

    adminOrg.owner = superAdmin._id;
    
    await adminOrg.save();
    await superAdmin.save();

    res.status(201).json({ success: true, message: 'Super Admin created successfully!' });
  } catch (error: any) {
    console.error('Error creating Super Admin:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// ==========================================================

// FILE: backend/controllers/propertiesController.ts
import { Request, Response } from 'express';
import Property from '../models/Property';
import User from '../models/User';
import auditService from '../services/auditService';

export const getProperties = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const properties = await Property.find({ organizationId: req.user?.organizationId });
    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const propertyData = {
      ...req.body,
      organizationId: req.user?.organizationId,
      createdBy: req.user?.id,
    };
    const property = await Property.create(propertyData);
    auditService.recordAction(req.user!.id, req.user!.organizationId, 'PROPERTY_CREATE', { propertyId: property._id.toString(), propertyName: property.name });
    res.status(201).json({ success: true, data: property });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Add other property controller functions (getPropertyById, updateProperty, deleteProperty) here...
export const getPropertyById = async (req: Request, res: Response) => { /* ... */ };
export const updateProperty = async (req: Request, res: Response) => { /* ... */ };
export const deleteProperty = async (req: Request, res: Response) => { /* ... */ };
