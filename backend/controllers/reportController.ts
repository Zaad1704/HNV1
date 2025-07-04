import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Property from '../models/Property';
import Tenant from '../models/Tenant';

interface AuthRequest extends Request {
  user?: any;
}

export const generateFinancialReport = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { format = 'standard', startDate, endDate } = req.query;
    
    const dateFilter: any = { organizationId: req.user.organizationId };
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate as string);
    }

    const payments = await Payment.find(dateFilter)
      .populate('tenantId', 'name')
      .populate('propertyId', 'name')
      .populate('organizationId', 'name')
      .lean();

    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalPayments = payments.length;

    if (format === 'thermal') {
      const thermalReport = generateThermalFinancialReport({
        payments,
        totalRevenue,
        totalPayments,
        organization: (payments[0] as any)?.organizationId,
        startDate,
        endDate
      });
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="financial-report-${Date.now()}.txt"`);
      return res.send(thermalReport);
    }

    res.status(200).json({
      success: true,
      data: {
        payments,
        summary: {
          totalRevenue,
          totalPayments,
          averagePayment: totalPayments > 0 ? totalRevenue / totalPayments : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const generateThermalFinancialReport = (data: any): string => {
  const line = '--------------------------------';
  const doubleLine = '================================';
  
  return `
${doubleLine}
    ${(data.organization?.name || 'ORGANIZATION').toUpperCase()}
${doubleLine}

FINANCIAL REPORT
Generated: ${new Date().toLocaleDateString()}
Period: ${data.startDate ? new Date(data.startDate).toLocaleDateString() : 'All Time'} - ${data.endDate ? new Date(data.endDate).toLocaleDateString() : 'Present'}

${line}
SUMMARY
${line}
Total Payments: ${data.totalPayments}
Total Revenue: $${data.totalRevenue.toFixed(2)}
Average Payment: $${data.totalPayments > 0 ? (data.totalRevenue / data.totalPayments).toFixed(2) : '0.00'}

${line}
PAYMENT DETAILS
${line}
${data.payments.slice(0, 10).map((payment: any) => 
  `${new Date(payment.paymentDate).toLocaleDateString()} - ${payment.tenantId?.name || 'N/A'}\n$${payment.amount.toFixed(2)} - ${payment.status}`
).join('\n\n')}

${data.payments.length > 10 ? `\n... and ${data.payments.length - 10} more payments` : ''}

${line}
Powered by HNV Property
Management Solutions
${doubleLine}
`;
};