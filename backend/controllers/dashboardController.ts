import { Request, Response } from 'express';
import Property from '../models/Property';
import Tenant from '../models/Tenant';

export const getOverviewStats = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });

  const { organizationId } = req.user;

  const propertyCount = await Property.countDocuments({ organizationId });
  const tenantCount = await Tenant.countDocuments({ organizationId });

  res.status(200).json({
    success: true,
    data: {
      properties: propertyCount,
      tenants: tenantCount,
      occupancy: 0,
      revenue: 0,
    }
  });
};
