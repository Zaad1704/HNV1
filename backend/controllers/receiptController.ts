import { Request, Response } from 'express';
import Payment from '../models/Payment';

interface AuthRequest extends Request {
  user?: any;
}

export const generatePaymentReceipt = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const paymentId = req.params.paymentId;
    const { format: printFormat = 'standard' } = req.query;

    const payment = await Payment.findById(paymentId)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .populate('recordedBy', 'name')
      .lean();

    if (!payment || payment.organizationId._id.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    // Generate thermal receipt format
    if (printFormat === 'thermal') {
      const thermalReceipt = generateThermalPaymentReceipt(payment);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment._id}-thermal.txt"`);
      return res.send(thermalReceipt);
    }

    // Standard format
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const generateThermalPaymentReceipt = (payment: any): string => {
  const line = '--------------------------------';
  const doubleLine = '================================';
  
  return `
${doubleLine}
    ${(payment.organizationId?.name || 'ORGANIZATION').toUpperCase()}
${doubleLine}

PAYMENT RECEIPT
Receipt #: ${payment._id}
Date: ${new Date(payment.paymentDate).toLocaleDateString()}
Time: ${new Date(payment.paymentDate).toLocaleTimeString()}

${line}
TENANT INFORMATION
${line}
Name: ${payment.tenantId?.name || 'N/A'}
Email: ${payment.tenantId?.email || 'N/A'}
Phone: ${payment.tenantId?.phone || 'N/A'}

${line}
PROPERTY INFORMATION
${line}
Property: ${payment.propertyId?.name || 'N/A'}
Address: ${payment.propertyId?.address || 'N/A'}

${line}
PAYMENT DETAILS
${line}
${payment.lineItems?.map((item: any) => 
  `${item.description}\n$${item.amount.toFixed(2)}`
).join('\n\n') || `Payment for ${payment.propertyId?.name || 'Property'}\n$${payment.amount.toFixed(2)}`}

${line}
TOTAL PAID: $${payment.amount.toFixed(2)}
Status: ${payment.status.toUpperCase()}
Method: ${payment.paymentMethod || 'N/A'}
${line}

Thank you for your payment!

${line}
Powered by HNV Property
Management Solutions
${doubleLine}
`;
};