// backend/controllers/dashboardController.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import { startOfMonth, endOfMonth, subMonths, addDays } from 'date-fns';

export const getOverviewStats = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      res.status(401);
      throw new Error('User not authorized');
    }
  
    const queryScope = req.user.role === 'Super Admin' ? {} : { organizationId: req.user.organizationId };

    const propertyCount = await Property.countDocuments(queryScope);
    const tenantCount = await Tenant.countDocuments({ ...queryScope, status: 'Active' });
      
    const unitsCountResult = await Property.aggregate([
        { $match: queryScope },
        { $group: { _id: null, total: { $sum: "$numberOfUnits" } } }
    ]);
    const totalUnits = unitsCountResult[0]?.total || 0;
    const occupancyRate = totalUnits > 0 ? (tenantCount / totalUnits) : 0;

    const monthlyPayments = await Payment.aggregate([
        { $match: { ...queryScope, paymentDate: { $gte: startOfMonth(new Date()) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const monthlyRevenue = monthlyPayments[0]?.total || 0;

    res.status(200).json({
      success: true,
      data: {
        totalProperties: propertyCount,
        activeTenants: tenantCount,
        occupancyRate: occupancyRate,
        monthlyRevenue: monthlyRevenue,
      }
    });
});

// NEW FUNCTION
export const getLateTenants = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');
    }
    const queryScope = req.user.role === 'Super Admin' ? {} : { organizationId: req.user.organizationId };

    const lateTenants = await Tenant.find({ ...queryScope, status: 'Late' })
        .populate('propertyId', 'name')
        .limit(5);

    res.status(200).json({ success: true, data: lateTenants });
});

// NEW FUNCTION
export const getExpiringLeases = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');
    }
    const queryScope = req.user.role === 'Super Admin' ? {} : { organizationId: req.user.organizationId };
    
    const sixtyDaysFromNow = addDays(new Date(), 60);

    const expiringLeases = await Tenant.find({
        ...queryScope,
        leaseEndDate: { $lte: sixtyDaysFromNow }
    }).populate('propertyId', 'name').limit(5);

    res.status(200).json({ success: true, data: expiringLeases });
});
