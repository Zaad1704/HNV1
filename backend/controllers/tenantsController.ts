import { Request, Response } from 'express';
import Tenant from '../models/Tenant';
import Property from '../models/Property';
import actionChainService from '../services/actionChainService';

interface AuthRequest extends Request {
  user?: any;
}

export const getTenants = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Build query with optional propertyId filter
    const query: any = { organizationId: req.user.organizationId };
    if (req.query.propertyId) {
      query.propertyId = req.query.propertyId;
    }

    const tenants = await Tenant.find(query)
    .populate('propertyId', 'name')
    .lean()
    .exec() || [];

    res.status(200).json({ success: true, data: tenants });
  } catch (error) {
    console.error('Get tenants error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch tenants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createTenant = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { propertyId } = req.body;

    // Verify property if provided
    if (propertyId) {
      const property = await Property.findById(propertyId);
      if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid property' 
        });
      }
    }

    // Handle image uploads
    const imageUrls: any = {};
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (files) {
      try {
        const { uploadToCloudinary, isCloudinaryConfigured } = await import('../utils/cloudinary');
        
        for (const [fieldname, fileArray] of Object.entries(files)) {
          if (fileArray && fileArray[0]) {
            const file = fileArray[0];
            if (isCloudinaryConfigured()) {
              imageUrls[fieldname] = await uploadToCloudinary(file, 'tenants');
            } else {
              imageUrls[fieldname] = `/uploads/images/${file.filename}`;
            }
          }
        }
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }

    const tenantData = { 
      ...req.body, 
      ...imageUrls,
      organizationId: req.user.organizationId 
    };

    const tenant = await Tenant.create(tenantData);
    
    // Trigger action chain
    await actionChainService.onTenantAdded(tenant, req.user._id, req.user.organizationId);
    
    res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    console.error('Create tenant error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getTenantById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: tenant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateTenant = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updatedTenant });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deleteTenant = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    await tenant.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// NEW DATA PREVIEW ENDPOINTS
export const getTenantDataPreviews = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { tenantId } = req.params;
    const { status, date } = req.query;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const [Payment, Receipt, Expense, MaintenanceRequest, Reminder, ApprovalRequest, AuditLog] = await Promise.all([
      import('../models/Payment'),
      import('../models/Receipt'),
      import('../models/Expense'),
      import('../models/MaintenanceRequest'),
      import('../models/Reminder'),
      import('../models/ApprovalRequest'),
      import('../models/AuditLog')
    ]);

    let baseQuery: any = { tenantId, organizationId: user.organizationId };
    
    const [payments, receipts, expenses, maintenance, reminders, approvals, auditLogs] = await Promise.all([
      Payment.default.find(baseQuery).populate('propertyId', 'name').populate('tenantId', 'name unit').sort({ paymentDate: -1 }).limit(5).lean(),
      Receipt.default.find(baseQuery).populate('propertyId', 'name').populate('tenantId', 'name unit').sort({ createdAt: -1 }).limit(5).lean(),
      Expense.default.find({ propertyId: tenant.propertyId, organizationId: user.organizationId }).populate('propertyId', 'name').sort({ date: -1 }).limit(5).lean(),
      MaintenanceRequest.default.find(baseQuery).populate('assignedTo', 'name').populate('propertyId', 'name').populate('tenantId', 'name unit').sort({ createdAt: -1 }).limit(5).lean(),
      Reminder.default.find(baseQuery).populate('tenantId', 'name unit').populate('propertyId', 'name').sort({ nextRunDate: 1 }).limit(5).lean(),
      ApprovalRequest.default.find({ tenantId, organizationId: user.organizationId }).populate('requestedBy', 'name').populate('propertyId', 'name').sort({ createdAt: -1 }).limit(5).lean(),
      AuditLog.default.find({ 
        organizationId: user.organizationId,
        $or: [{ resourceId: tenantId }, { 'metadata.tenantId': tenantId }]
      }).populate('userId', 'name').sort({ timestamp: -1 }).limit(10).lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments: payments.map(p => ({
          _id: p._id,
          amount: p.amount,
          status: p.status,
          paymentDate: p.paymentDate,
          paymentMethod: p.paymentMethod,
          rentMonth: p.rentMonth,
          property: p.propertyId,
          tenant: p.tenantId
        })),
        receipts: receipts.map(r => ({
          _id: r._id,
          receiptNumber: r.receiptNumber,
          amount: r.amount,
          paymentDate: r.paymentDate,
          paymentMethod: r.paymentMethod,
          property: r.propertyId,
          tenant: r.tenantId
        })),
        expenses: expenses.map(e => ({
          _id: e._id,
          description: e.description,
          amount: e.amount,
          category: e.category,
          date: e.date,
          property: e.propertyId
        })),
        maintenance: maintenance.map(m => ({
          _id: m._id,
          description: m.description,
          status: m.status,
          priority: m.priority,
          assignedTo: m.assignedTo,
          createdAt: m.createdAt,
          property: m.propertyId,
          tenant: m.tenantId
        })),
        reminders: reminders.map(r => ({
          _id: r._id,
          title: r.title,
          type: r.type,
          status: r.status,
          nextRunDate: r.nextRunDate,
          tenant: r.tenantId,
          property: r.propertyId
        })),
        approvals: approvals.map(a => ({
          _id: a._id,
          type: a.type,
          description: a.description,
          status: a.status,
          priority: a.priority,
          requestedBy: a.requestedBy,
          createdAt: a.createdAt,
          property: a.propertyId
        })),
        auditLogs: auditLogs.map(l => ({
          _id: l._id,
          action: l.action,
          resource: l.resource,
          description: l.description,
          user: l.userId,
          timestamp: l.timestamp,
          severity: l.severity
        }))
      }
    });
  } catch (error) {
    console.error('Tenant data previews error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getTenantStats = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const [Payment, MaintenanceRequest] = await Promise.all([
      import('../models/Payment'),
      import('../models/MaintenanceRequest')
    ]);

    const [payments, maintenance] = await Promise.all([
      Payment.default.find({ tenantId, organizationId: user.organizationId }).lean(),
      MaintenanceRequest.default.find({ tenantId, organizationId: user.organizationId }).lean()
    ]);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyPayments = payments.filter((p: any) => {
      const paymentDate = new Date(p.paymentDate);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    
    const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const monthlyPaid = monthlyPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const outstandingAmount = monthlyPaid >= (tenant.rentAmount || 0) ? 0 : (tenant.rentAmount || 0) - monthlyPaid;
    
    const openMaintenance = maintenance.filter((m: any) => m.status === 'Open').length;
    const totalMaintenance = maintenance.length;
    
    const leaseStartDate = tenant.createdAt ? new Date(tenant.createdAt) : new Date();
    const monthsSinceStart = (currentYear - leaseStartDate.getFullYear()) * 12 + (currentMonth - leaseStartDate.getMonth()) + 1;
    const monthsPaid = payments.length;
    const paymentRate = monthsSinceStart > 0 ? (monthsPaid / monthsSinceStart) * 100 : 0;

    res.status(200).json({
      success: true,
      data: {
        payments: {
          total: payments.length,
          totalAmount: totalPaid,
          monthlyPaid,
          outstanding: outstandingAmount,
          paymentRate: Math.round(paymentRate)
        },
        maintenance: {
          total: totalMaintenance,
          open: openMaintenance,
          closed: totalMaintenance - openMaintenance
        },
        lease: {
          startDate: leaseStartDate,
          monthsSinceStart,
          monthsPaid,
          rentAmount: tenant.rentAmount || 0
        }
      }
    });
  } catch (error) {
    console.error('Tenant stats error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getTenantAnalytics = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { tenantId } = req.params;
    const { range = '12months' } = req.query;

    const tenant = await Tenant.findById(tenantId);
    if (!tenant || tenant.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const [Payment, MaintenanceRequest] = await Promise.all([
      import('../models/Payment'),
      import('../models/MaintenanceRequest')
    ]);

    const endDate = new Date();
    const startDate = new Date();
    switch (range) {
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case '12months':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setFullYear(2020);
    }

    const [payments, maintenance] = await Promise.all([
      Payment.default.find({ 
        tenantId, 
        organizationId: user.organizationId,
        paymentDate: { $gte: startDate, $lte: endDate }
      }).lean(),
      MaintenanceRequest.default.find({ 
        tenantId, 
        organizationId: user.organizationId,
        createdAt: { $gte: startDate, $lte: endDate }
      }).lean()
    ]);

    const monthlyData = [];
    const months = range === '3months' ? 3 : range === '6months' ? 6 : 12;
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthPayments = payments.filter((p: any) => {
        const paymentDate = new Date(p.paymentDate);
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear();
      });
      
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        payments: monthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
        count: monthPayments.length
      });
    }

    res.status(200).json({
      success: true,
      data: {
        monthlyPayments: monthlyData,
        totalRevenue: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
        paymentCount: payments.length
      }
    });
  } catch (error) {
    console.error('Tenant analytics error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};