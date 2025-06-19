// controllers/dashboardController.ts
import { Request, Response } from 'express';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import { IUser } from '../models/User';

export const getOverviewStats = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const [properties, tenants, latePayments] = await Promise.all([
      Property.countDocuments({ organizationId: user.organizationId }),
      Tenant.countDocuments({ organizationId: user.organizationId }),
      Payment.countDocuments({
        organizationId: user.organizationId,
        status: 'overdue'
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        properties,
        tenants,
        latePayments
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

export const getFinancialSummary = async (req: Request, res: Response) => {
  const user = req.user as IUser;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const result = await Payment.aggregate([
      {
        $match: {
          organizationId: user.organizationId,
          paymentDate: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 1))
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue: result[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

export const getOccupancySummary = async (req: Request, res: Response) => {
  const user = req.user as IUser;
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
