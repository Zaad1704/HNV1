import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export const getCollectionSheet = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { month, year, propertyId } = req.query;
    
    if (!month || !year) {
      res.status(400).json({ success: false, message: 'Month and year are required' });
      return;
    }

    const [Tenant, Payment, Property] = await Promise.all([
      import('../models/Tenant'),
      import('../models/Payment'),
      import('../models/Property')
    ]);

    // Build query
    let tenantQuery: any = { organizationId: user.organizationId, status: { $ne: 'Archived' } };
    if (propertyId) {
      tenantQuery.propertyId = propertyId;
    }

    // Get tenants
    const tenants = await Tenant.default.find(tenantQuery)
      .populate('propertyId', 'name')
      .lean();

    // Get payments for the specified month/year
    const startDate = new Date(parseInt(year as string), parseInt(month as string) - 1, 1);
    const endDate = new Date(parseInt(year as string), parseInt(month as string), 0);

    const payments = await Payment.default.find({
      organizationId: user.organizationId,
      paymentDate: { $gte: startDate, $lte: endDate },
      status: 'Paid'
    }).lean();

    // Build collection data
    const collectionData = tenants.map((tenant: any) => {
      const tenantPayments = payments.filter((p: any) => 
        p.tenantId && p.tenantId.toString() === tenant._id.toString()
      );
      
      const paidAmount = tenantPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
      const latestPayment = tenantPayments.sort((a: any, b: any) => 
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )[0];

      return {
        tenantId: tenant._id,
        tenantName: tenant.name,
        propertyId: tenant.propertyId?._id,
        propertyName: tenant.propertyId?.name || 'N/A',
        unit: tenant.unit,
        rentAmount: tenant.rentAmount || 0,
        paidAmount,
        paymentDate: latestPayment?.paymentDate || null,
        paymentMethod: latestPayment?.paymentMethod || null,
        status: paidAmount >= (tenant.rentAmount || 0) ? 'Paid' : 'Pending'
      };
    });

    res.status(200).json({
      success: true,
      data: collectionData
    });
  } catch (error) {
    console.error('Collection sheet error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};