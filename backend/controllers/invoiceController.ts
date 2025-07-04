import { Request, Response } from 'express';
import Invoice from '../models/Invoice';
import Lease from '../models/Lease';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import { addMonths, startOfMonth, format } from 'date-fns';

interface AuthRequest extends Request {
  user?: any;
}

export const getInvoices = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const invoices = await Invoice.find({ organizationId: req.user.organizationId })
      .populate('tenantId', 'name email')
      .populate('propertyId', 'name address')
      .populate('leaseId')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch invoices',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const generateInvoices = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const targetDate = req.body.forMonth ? new Date(req.body.forMonth) : addMonths(new Date(), 1);
    const invoiceMonthStart = startOfMonth(targetDate);

    const activeLeases = await Lease.find({
      organizationId: req.user.organizationId,
      status: 'active'
    }).populate('tenantId').populate('propertyId');

    if (activeLeases.length === 0) {
      return res.status(200).json({ 
        success: true, 
        message: 'No active leases found to generate invoices for.' 
      });
    }

    const invoicesToCreate = [];
    let countForMonth = await Invoice.countDocuments({
      organizationId: req.user.organizationId,
      createdAt: { $gte: invoiceMonthStart }
    });

    for (const lease of activeLeases) {
      const existingInvoice = await Invoice.findOne({
        leaseId: lease._id,
        dueDate: invoiceMonthStart,
        status: { $in: ['pending', 'overdue'] }
      });

      if (existingInvoice) {
        continue;
      }

      const invoiceNumber = `INV-${req.user.organizationId.toString().substring(0, 5).toUpperCase()}-${format(invoiceMonthStart, 'yyyyMM')}-${(countForMonth + 1).toString().padStart(3, '0')}`;
      
      invoicesToCreate.push({
        tenantId: lease.tenantId._id,
        propertyId: lease.propertyId._id,
        organizationId: req.user.organizationId,
        leaseId: lease._id,
        invoiceNumber,
        amount: lease.rentAmount,
        dueDate: invoiceMonthStart,
        status: 'pending',
        lineItems: [{
          description: `Rent for ${format(invoiceMonthStart, 'MMM yyyy')}`,
          amount: lease.rentAmount
        }]
      });
      countForMonth++;
    }

    if (invoicesToCreate.length > 0) {
      await Invoice.insertMany(invoicesToCreate);
    }

    res.status(201).json({ 
      success: true, 
      message: `${invoicesToCreate.length} new invoices generated successfully for ${format(invoiceMonthStart, 'MMM yyyy')}.`,
      data: { count: invoicesToCreate.length }
    });
  } catch (error) {
    console.error('Generate invoices error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getInvoiceById = async (req: AuthRequest, res: Response) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'name address')
      .populate('leaseId');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const printInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { format: printFormat = 'standard' } = req.query;

    const invoice = await Invoice.findById(id)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Generate thermal receipt format (58mm width)
    if (printFormat === 'thermal') {
      const thermalReceipt = generateThermalReceipt(invoice);
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber}-thermal.txt"`);
      return res.send(thermalReceipt);
    }

    // Standard format
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const generateThermalReceipt = (invoice: any): string => {
  const line = '--------------------------------';
  const doubleLine = '================================';
  
  return `
${doubleLine}
    ${(invoice.organizationId?.name || 'ORGANIZATION').toUpperCase()}
${doubleLine}

RENT INVOICE
Invoice #: ${invoice.invoiceNumber}
Date: ${new Date(invoice.createdAt).toLocaleDateString()}
Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}

${line}
TENANT INFORMATION
${line}
Name: ${invoice.tenantId?.name || 'N/A'}
Email: ${invoice.tenantId?.email || 'N/A'}
Phone: ${invoice.tenantId?.phone || 'N/A'}

${line}
PROPERTY INFORMATION
${line}
Property: ${invoice.propertyId?.name || 'N/A'}
Address: ${invoice.propertyId?.address || 'N/A'}

${line}
ITEMS
${line}
${invoice.lineItems?.map((item: any) => 
  `${item.description}\n$${item.amount.toFixed(2)}`
).join('\n\n') || 'No items'}

${line}
TOTAL: $${invoice.amount.toFixed(2)}
Status: ${invoice.status.toUpperCase()}
${line}

Thank you for your payment!

${line}
Powered by HNV Property
Management Solutions
${doubleLine}
`;
};

export const bulkDownloadInvoices = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { ids, status, dateFrom, dateTo, format = 'thermal' } = req.query;
    let query: any = { organizationId: req.user.organizationId };

    if (ids) {
      query._id = { $in: (ids as string).split(',') };
    }
    if (status) {
      query.status = status;
    }
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) query.createdAt.$lte = new Date(dateTo as string);
    }

    const invoices = await Invoice.find(query)
      .populate('tenantId', 'name email phone')
      .populate('propertyId', 'name address')
      .populate('organizationId', 'name')
      .lean();

    if (format === 'thermal') {
      const bulkReceipts = invoices.map(invoice => 
        `${generateThermalReceipt(invoice)}\n\n${'='.repeat(50)}\n\n`
      ).join('');
      
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="bulk-invoices-${Date.now()}.txt"`);
      return res.send(bulkReceipts);
    }

    res.status(200).json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendWhatsAppInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { phone, message } = req.body;

    const invoice = await Invoice.findById(id)
      .populate('tenantId', 'name phone')
      .populate('organizationId', 'name')
      .lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const recipientPhone = phone || invoice.tenantId?.phone;
    if (!recipientPhone) {
      return res.status(400).json({ success: false, message: 'Phone number required' });
    }

    const whatsappMessage = message || `Hi ${invoice.tenantId?.name}, your invoice #${invoice.invoiceNumber} for $${invoice.amount} is ready. Amount due: $${invoice.amount}. Thank you!`;
    
    // WhatsApp Business API URL (free for basic messages)
    const whatsappUrl = `https://wa.me/${recipientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;
    
    res.status(200).json({ 
      success: true, 
      data: { 
        whatsappUrl,
        message: whatsappMessage,
        phone: recipientPhone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const sendEmailInvoice = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, subject, message } = req.body;

    const invoice = await Invoice.findById(id)
      .populate('tenantId', 'name email')
      .populate('organizationId', 'name')
      .lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const recipientEmail = email || invoice.tenantId?.email;
    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Email address required' });
    }

    const emailSubject = subject || `Invoice #${invoice.invoiceNumber} from ${invoice.organizationId?.name}`;
    const emailMessage = message || `Dear ${invoice.tenantId?.name},\n\nPlease find your invoice #${invoice.invoiceNumber} for $${invoice.amount}.\n\nThank you!\n\nPowered by HNV Property Management Solutions`;
    
    // Return email data for frontend to handle sending
    res.status(200).json({ 
      success: true, 
      data: { 
        to: recipientEmail,
        subject: emailSubject,
        message: emailMessage,
        invoice: generateThermalReceipt(invoice)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};