import { Request, Response } from 'express';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import { IUser } from '../models/User';

export const getDashboardStats = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const [totalUnits, occupiedUnits] = await Promise.all([
      Property.aggregate([
        { $match: { organizationId: user.organizationId } },
        { $group: { _id: null, total: { $sum: '$totalUnits' } } }
      ]),
      Tenant.countDocuments({
        organizationId: user.organizationId,
        status: 'active'
      })
    ]);

    const occupancyRate = totalUnits[0]?.total
      ? (occupiedUnits / totalUnits[0].total) * 100
      : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUnits: totalUnits[0]?.total || 0,
        occupiedUnits,
        occupancyRate: Math.round(occupancyRate)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
