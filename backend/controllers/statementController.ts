import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';

interface AuthRequest extends Request {
  user?: any;
}

export const generateTenantStatement = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { tenantId } = req.params;
    const { format = 'standard', startDate, endDate } = req.query;

    const tenant = await Tenant.findById(tenantId)
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .lean();

    if (!tenant || (tenant.organizationId as any)._id.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const dateFilter: any = { tenantId, organizationId: req.user.organizationId };
    if (startDate || endDate) {
      dateFilter.paymentDate = {};
      if (startDate) dateFilter.paymentDate.$gte = new Date(startDate as string);
      if (endDate) dateFilter.paymentDate.$lte = new Date(endDate as string);
    }

    const payments = await Payment.find(dateFilter).sort({ paymentDate: -1 }).lean();

    if (format === 'thermal') {
      const thermalStatement = generateThermalTenantStatement({
        tenant,
        payments,
        startDate,
        endDate
      });
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="statement-${tenant.name}-${Date.now()}.txt"`);
      return res.send(thermalStatement);
    }

    res.status(200).json({
      success: true,
      data: {
        tenant,
        payments,
        summary: {
          totalPaid: payments.reduce((sum, p) => sum + p.amount, 0),
          totalPayments: payments.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const generateThermalTenantStatement = (data: any): string => {
  const line = '--------------------------------';
  const doubleLine = '================================';
  
  return `
${doubleLine}
    ${(data.tenant.organizationId?.name || 'ORGANIZATION').toUpperCase()}
${doubleLine}

TENANT STATEMENT
Generated: ${new Date().toLocaleDateString()}
Period: ${data.startDate ? new Date(data.startDate).toLocaleDateString() : 'All Time'} - ${data.endDate ? new Date(data.endDate).toLocaleDateString() : 'Present'}

${line}
TENANT INFORMATION
${line}
Name: ${data.tenant.name}
Email: ${data.tenant.email || 'N/A'}
Phone: ${data.tenant.phone || 'N/A'}
Unit: ${data.tenant.unit || 'N/A'}

${line}
PROPERTY INFORMATION
${line}
Property: ${data.tenant.propertyId?.name || 'N/A'}
Address: ${data.tenant.propertyId?.address || 'N/A'}
Monthly Rent: $${data.tenant.rentAmount?.toFixed(2) || '0.00'}

${line}
PAYMENT HISTORY
${line}
${data.payments.map((payment: any) => 
  `${new Date(payment.paymentDate).toLocaleDateString()}\n$${payment.amount.toFixed(2)} - ${payment.status.toUpperCase()}`
).join('\n\n')}

${line}
SUMMARY
${line}
Total Payments: ${data.payments.length}
Total Amount Paid: $${data.payments.reduce((sum: number, p: any) => sum + p.amount, 0).toFixed(2)}

${line}
Powered by HNV Property
Management Solutions
${doubleLine}
`;
};