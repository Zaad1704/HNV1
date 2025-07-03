import { Router } from 'express';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import { startOfMonth, endOfMonth } from 'date-fns';

const router = Router();

// Monthly collection sheet
router.get('/monthly-collection', asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.organizationId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { month, year } = req.query;
  const targetDate = new Date(Number(year), Number(month) - 1, 1);
  const monthStart = startOfMonth(targetDate);
  const monthEnd = endOfMonth(targetDate);

  const tenants = await Tenant.find({ 
    organizationId: req.user.organizationId,
    status: 'Active'
  }).populate('propertyId', 'name');

  const collectionData = await Promise.all(
    tenants.map(async (tenant) => {
      // Check if payment exists for this month
      const payment = await Payment.findOne({
        tenantId: tenant._id,
        paymentDate: { $gte: monthStart, $lte: monthEnd },
        status: 'Paid'
      });

      // Find overdue months (simplified logic)
      const overduePayments = await Payment.find({
        tenantId: tenant._id,
        paymentDate: { $lt: monthStart },
        status: { $ne: 'Paid' }
      });

      return {
        _id: tenant._id,
        tenantName: tenant.name,
        unitNo: tenant.unit,
        propertyName: (tenant.propertyId as any)?.name || 'N/A',
        rentAmount: tenant.rentAmount || 0,
        rentStartMonth: `${month}/${year}`,
        overdueMonths: overduePayments.map(p => 
          new Date(p.paymentDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        ),
        isCollected: !!payment
      };
    })
  );

  res.json({ success: true, data: collectionData });
}));

export default router;