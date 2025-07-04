import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';
import Invoice from '../models/Invoice';
import whatsAppService from '../services/whatsAppService';

interface AuthRequest extends Request {
  user?: any;
}

export const createBulkPayments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { payments } = req.body; // Array of payment objects

    if (!payments || !Array.isArray(payments)) {
      return res.status(400).json({ success: false, message: 'Payments array required' });
    }

    const createdPayments = [];
    const createdInvoices = [];

    for (const paymentData of payments) {
      const { tenantId, amount, paymentDate, status = 'Paid' } = paymentData;

      const tenant = await Tenant.findById(tenantId);
      if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
        continue; // Skip invalid tenants
      }

      // Create payment
      const payment = await Payment.create({
        tenantId,
        amount,
        paymentDate,
        status,
        propertyId: tenant.propertyId,
        organizationId: req.user.organizationId,
        recordedBy: req.user._id
      });

      // Auto-generate invoice
      const invoiceNumber = `INV-${req.user.organizationId.toString().substring(0, 5).toUpperCase()}-${Date.now()}-${createdInvoices.length + 1}`;
      const invoice = await Invoice.create({
        tenantId,
        propertyId: tenant.propertyId,
        organizationId: req.user.organizationId,
        invoiceNumber,
        amount,
        dueDate: paymentDate,
        status: status === 'Paid' ? 'paid' : 'pending',
        lineItems: [{
          description: `Bulk Payment - ${new Date(paymentDate).toLocaleDateString()}`,
          amount
        }],
        paidAt: status === 'Paid' ? paymentDate : undefined,
        transactionId: payment._id.toString()
      });

      createdPayments.push(payment);
      createdInvoices.push(invoice);
    }

    res.status(201).json({
      success: true,
      data: {
        payments: createdPayments,
        invoices: createdInvoices,
        count: createdPayments.length
      }
    });
  } catch (error) {
    console.error('Bulk payment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendBulkWhatsAppNotices = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantIds, messageType, customMessage } = req.body;

    if (!tenantIds || !Array.isArray(tenantIds)) {
      return res.status(400).json({ success: false, message: 'Tenant IDs array required' });
    }

    const tenants = await Tenant.find({
      _id: { $in: tenantIds },
      organizationId: req.user.organizationId
    }).populate('organizationId', 'name');

    const whatsappUrls = [];

    for (const tenant of tenants) {
      if (!tenant.phone) continue;

      let message = customMessage;
      
      if (!message) {
        switch (messageType) {
          case 'reminder':
            message = whatsAppService.generateReminderMessage(
              tenant.name,
              tenant.rentAmount || 0,
              'end of month',
              tenant.organizationId?.name || 'Property Management'
            );
            break;
          case 'notice':
            message = `Hi ${tenant.name}! This is an important notice from ${tenant.organizationId?.name || 'Property Management'}. Please contact us for more details. Powered by HNV Property Management Solutions`;
            break;
          default:
            message = `Hi ${tenant.name}! Message from ${tenant.organizationId?.name || 'Property Management'}. Powered by HNV Property Management Solutions`;
        }
      }

      const whatsappUrl = whatsAppService.generateWhatsAppUrl(tenant.phone, message);
      whatsappUrls.push({
        tenantId: tenant._id,
        tenantName: tenant.name,
        phone: tenant.phone,
        whatsappUrl,
        message
      });
    }

    res.status(200).json({
      success: true,
      data: whatsappUrls
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};