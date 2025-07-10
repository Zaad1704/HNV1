import { Request, Response } from 'express';
import Property from '../models/Property';
import actionChainService from '../services/actionChainService';
import { checkUsageLimit, updateUsageCount } from '../middleware/subscriptionMiddleware';

interface AuthRequest extends Request {
  user?: any;
  file?: any;
}

export const createProperty = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  // Check usage limit before creating
  const subscriptionService = (await import('../services/subscriptionService')).default;
  const usageCheck = await subscriptionService.checkUsageLimit(user.organizationId, 'properties');
  
  if (!usageCheck.allowed) {
    res.status(403).json({
      success: false,
      message: 'Property limit exceeded',
      reason: usageCheck.reason,
      currentUsage: usageCheck.currentUsage,
      limit: usageCheck.limit
    });
    return;
  }

  try {
    const imageUrl = req.file ? req.file.imageUrl : undefined;
    const property = await Property.create({
      ...req.body,
      imageUrl: imageUrl,
      organizationId: user.organizationId,
      createdBy: user._id,
      managedByAgentId: req.body.managedByAgentId || null
    });

    // Trigger action chain
    await actionChainService.onPropertyAdded(property, user._id, user.organizationId);
    
    // Update usage count
    await subscriptionService.updateUsage(user.organizationId, 'properties', 1);

    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getProperties = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    let query: any = { organizationId: user.organizationId };
    
    // Agents see only properties they manage
    if (user.role === 'Agent') {
      // Get user's managed properties from User model
      const userData = await require('../models/User').default.findById(user._id).select('managedProperties');
      const managedPropertyIds = userData?.managedProperties || [];
      
      query = {
        organizationId: user.organizationId,
        _id: { $in: managedPropertyIds }
      };
    }

    const properties = await Property.find(query)
      .populate('createdBy', 'name')
      .populate('managedByAgentId', 'name')
      .lean()
      .exec() || [];
    res.status(200).json({ success: true, data: properties });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch properties',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getPropertyById = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to view this property' });
      return;
    }

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    let property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this property' });
      return;
    }

    const updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = req.file.imageUrl;
    }

    property = await Property.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: property });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
  }

  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      res.status(404).json({ success: false, message: 'Property not found' });
      return;
    }

    if (property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
      return;
    }

    await property.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// NEW DATA PREVIEW ENDPOINTS
export const getPropertyDataPreviews = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyId } = req.params;
    const { unit } = req.query;

    // Verify property access
    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const [Payment, Receipt, Expense, MaintenanceRequest, Reminder, ApprovalRequest, AuditLog, Tenant] = await Promise.all([
      import('../models/Payment'),
      import('../models/Receipt'),
      import('../models/Expense'),
      import('../models/MaintenanceRequest'),
      import('../models/Reminder'),
      import('../models/ApprovalRequest'),
      import('../models/AuditLog'),
      import('../models/Tenant')
    ]);

    // Base query filters
    let baseQuery: any = { propertyId, organizationId: user.organizationId };
    let tenantQuery: any = { propertyId, organizationId: user.organizationId };
    
    if (unit) {
      const tenant = await Tenant.default.findOne({ propertyId, unit, organizationId: user.organizationId });
      if (tenant) {
        baseQuery.tenantId = tenant._id;
        tenantQuery._id = tenant._id;
      } else {
        baseQuery.tenantId = null; // No data for non-existent unit
      }
    }

    const [payments, receipts, expenses, maintenance, reminders, approvals, auditLogs] = await Promise.all([
      Payment.default.find(baseQuery)
        .populate('tenantId', 'name unit')
        .sort({ paymentDate: -1 })
        .limit(5)
        .lean(),
      Receipt.default.find(baseQuery)
        .populate('tenantId', 'name unit')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Expense.default.find(unit ? {} : { propertyId, organizationId: user.organizationId })
        .sort({ date: -1 })
        .limit(5)
        .lean(),
      MaintenanceRequest.default.find(baseQuery)
        .populate('tenantId', 'name unit')
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Reminder.default.find(unit ? tenantQuery : { propertyId, organizationId: user.organizationId })
        .populate('tenantId', 'name unit')
        .sort({ nextRunDate: 1 })
        .limit(5)
        .lean(),
      ApprovalRequest.default.find({ propertyId, organizationId: user.organizationId })
        .populate('requestedBy', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      AuditLog.default.find({ 
        organizationId: user.organizationId,
        $or: [{ resourceId: propertyId }, { 'metadata.propertyId': propertyId }]
      })
        .populate('userId', 'name')
        .sort({ timestamp: -1 })
        .limit(10)
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        payments: payments.map(p => ({
          _id: p._id,
          amount: p.amount,
          status: p.status,
          paymentDate: p.paymentDate,
          tenant: p.tenantId,
          paymentMethod: p.paymentMethod,
          rentMonth: p.rentMonth
        })),
        receipts: receipts.map(r => ({
          _id: r._id,
          receiptNumber: r.receiptNumber,
          amount: r.amount,
          paymentDate: r.paymentDate,
          tenant: r.tenantId,
          paymentMethod: r.paymentMethod
        })),
        expenses: expenses.map(e => ({
          _id: e._id,
          description: e.description,
          amount: e.amount,
          category: e.category,
          date: e.date
        })),
        maintenance: maintenance.map(m => ({
          _id: m._id,
          description: m.description,
          status: m.status,
          priority: m.priority,
          tenant: m.tenantId,
          assignedTo: m.assignedTo,
          createdAt: m.createdAt
        })),
        reminders: reminders.map(r => ({
          _id: r._id,
          title: r.title,
          type: r.type,
          status: r.status,
          nextRunDate: r.nextRunDate,
          tenant: r.tenantId
        })),
        approvals: approvals.map(a => ({
          _id: a._id,
          type: a.type,
          description: a.description,
          status: a.status,
          priority: a.priority,
          requestedBy: a.requestedBy,
          createdAt: a.createdAt
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
    console.error('Property data previews error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getUnitData = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { propertyId, unitNumber } = req.params;

    // Verify property access
    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized' });
      return;
    }

    const [Payment, Receipt, Expense, MaintenanceRequest, Reminder, Tenant] = await Promise.all([
      import('../models/Payment'),
      import('../models/Receipt'),
      import('../models/Expense'),
      import('../models/MaintenanceRequest'),
      import('../models/Reminder'),
      import('../models/Tenant')
    ]);

    // Find tenant for this unit
    const tenant = await Tenant.default.findOne({ 
      propertyId, 
      unit: unitNumber, 
      organizationId: user.organizationId 
    });

    if (!tenant) {
      res.status(404).json({ success: false, message: 'Unit not found or vacant' });
      return;
    }

    const [payments, receipts, expenses, maintenance, reminders] = await Promise.all([
      Payment.default.find({ tenantId: tenant._id, propertyId, organizationId: user.organizationId })
        .sort({ paymentDate: -1 })
        .lean(),
      Receipt.default.find({ tenantId: tenant._id, propertyId, organizationId: user.organizationId })
        .sort({ createdAt: -1 })
        .lean(),
      Expense.default.find({ propertyId, organizationId: user.organizationId })
        .sort({ date: -1 })
        .lean(),
      MaintenanceRequest.default.find({ tenantId: tenant._id, propertyId, organizationId: user.organizationId })
        .populate('assignedTo', 'name')
        .sort({ createdAt: -1 })
        .lean(),
      Reminder.default.find({ tenantId: tenant._id, organizationId: user.organizationId })
        .sort({ nextRunDate: 1 })
        .lean()
    ]);

    res.status(200).json({
      success: true,
      data: {
        tenant: {
          _id: tenant._id,
          name: tenant.name,
          email: tenant.email,
          unit: tenant.unit,
          rentAmount: tenant.rentAmount,
          status: tenant.status
        },
        payments: payments.map(p => ({
          _id: p._id,
          amount: p.amount,
          status: p.status,
          paymentDate: p.paymentDate,
          paymentMethod: p.paymentMethod,
          rentMonth: p.rentMonth
        })),
        receipts: receipts.map(r => ({
          _id: r._id,
          receiptNumber: r.receiptNumber,
          amount: r.amount,
          paymentDate: r.paymentDate,
          paymentMethod: r.paymentMethod
        })),
        expenses: expenses.map(e => ({
          _id: e._id,
          description: e.description,
          amount: e.amount,
          category: e.category,
          date: e.date
        })),
        maintenance: maintenance.map(m => ({
          _id: m._id,
          description: m.description,
          status: m.status,
          priority: m.priority,
          assignedTo: m.assignedTo,
          createdAt: m.createdAt
        })),
        reminders: reminders.map(r => ({
          _id: r._id,
          title: r.title,
          type: r.type,
          status: r.status,
          nextRunDate: r.nextRunDate
        }))
      }
    });
  } catch (error) {
    console.error('Unit data error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};