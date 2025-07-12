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

    // Validate required fields
    const { name, email, phone, propertyId, unit, rentAmount, leaseStartDate, leaseEndDate, securityDeposit } = req.body;
    
    if (!name || !email || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and phone are required' 
      });
    }
    
    if (!propertyId || !unit) {
      return res.status(400).json({ 
        success: false, 
        message: 'Property and unit are required' 
      });
    }
    
    if (!rentAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rent amount is required' 
      });
    }

    // Verify property
    const property = await Property.findById(propertyId);
    if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid property or property not found' 
      });
    }

    // Check if unit is already occupied
    const existingTenant = await Tenant.findOne({
      propertyId,
      unit,
      status: { $in: ['Active', 'Late'] },
      organizationId: req.user.organizationId
    });
    
    if (existingTenant) {
      return res.status(400).json({ 
        success: false, 
        message: `Unit ${unit} is already occupied by ${existingTenant.name}` 
      });
    }

    // Handle image uploads with Cloudinary
    const imageUrls: any = {};
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (files) {
      try {
        const { uploadToCloudinary, isCloudinaryConfigured } = await import('../utils/cloudinary');
        
        if (isCloudinaryConfigured()) {
          console.log('Uploading images to Cloudinary...');
          
          for (const [fieldname, fileArray] of Object.entries(files)) {
            if (fileArray && fileArray[0]) {
              const file = fileArray[0];
              try {
                console.log(`Uploading ${fieldname} to Cloudinary...`);
                const cloudinaryUrl = await uploadToCloudinary(file, 'tenants');
                
                imageUrls[fieldname] = cloudinaryUrl;
                if (fieldname === 'tenantImage') {
                  imageUrls.imageUrl = cloudinaryUrl;
                } else if (fieldname === 'govtIdFront') {
                  imageUrls.govtIdFront = cloudinaryUrl;
                } else if (fieldname === 'govtIdBack') {
                  imageUrls.govtIdBack = cloudinaryUrl;
                } else if (fieldname.startsWith('adult_')) {
                  imageUrls[fieldname] = cloudinaryUrl;
                }
                
                console.log(`✅ ${fieldname} uploaded successfully:`, cloudinaryUrl);
              } catch (uploadError) {
                console.error(`❌ Failed to upload ${fieldname}:`, uploadError);
                // Continue without failing the entire request
              }
            }
          }
        } else {
          console.log('Cloudinary not configured, using local storage...');
          // Fallback to local storage
          for (const [fieldname, fileArray] of Object.entries(files)) {
            if (fileArray && fileArray[0]) {
              const file = fileArray[0];
              const localUrl = `/uploads/images/${file.filename}`;
              
              imageUrls[fieldname] = localUrl;
              if (fieldname === 'tenantImage') {
                imageUrls.imageUrl = localUrl;
              } else if (fieldname === 'govtIdFront') {
                imageUrls.govtIdFront = localUrl;
              } else if (fieldname === 'govtIdBack') {
                imageUrls.govtIdBack = localUrl;
              } else if (fieldname.startsWith('adult_')) {
                imageUrls[fieldname] = localUrl;
              }
            }
          }
        }
      } catch (error) {
        console.error('Image upload error:', error);
        // Continue without failing - images are optional for basic functionality
      }
    }


    // Handle additional adults data with images
    let additionalAdults = [];
    if (req.body.additionalAdults) {
      try {
        const parsed = JSON.parse(req.body.additionalAdults);
        additionalAdults = Array.isArray(parsed) ? parsed.map((adult, index) => ({
          ...adult,
          imageUrl: imageUrls[`adult_${index}_photo`] || '',
          govtIdImageUrl: imageUrls[`adult_${index}_govtId`] || ''
        })) : [];
      } catch (e) {
        console.error('Failed to parse additional adults:', e);
        additionalAdults = [];
      }
    }

    // Handle emergency contact
    const emergencyContact = {
      name: req.body.emergencyContactName || '',
      phone: req.body.emergencyContactPhone || '',
      relation: req.body.emergencyContactRelation || ''
    };
    
    // Handle reference data
    const reference = {
      name: req.body.referenceName || '',
      phone: req.body.referencePhone || '',
      email: req.body.referenceEmail || '',
      address: req.body.referenceAddress || '',
      relation: req.body.referenceRelation || '',
      govtIdNumber: req.body.referenceGovtId || ''
    };

    // Prepare tenant data with proper type conversion
    const tenantData = { 
      name,
      email,
      phone,
      whatsappNumber: req.body.whatsappNumber || '',
      propertyId,
      unit,
      rentAmount: Number(rentAmount) || 0,
      leaseStartDate: new Date(leaseStartDate),
      leaseEndDate: new Date(leaseEndDate),
      leaseDuration: Number(req.body.leaseDuration) || 12,
      securityDeposit: Number(securityDeposit) || 0,
      advanceRent: Number(req.body.advanceRent) || 0,
      status: req.body.status || 'Active',
      fatherName: req.body.fatherName || '',
      motherName: req.body.motherName || '',
      presentAddress: req.body.presentAddress || '',
      permanentAddress: req.body.permanentAddress || '',
      govtIdNumber: req.body.govtIdNumber || '',
      occupation: req.body.occupation || '',
      monthlyIncome: Number(req.body.monthlyIncome) || 0,
      previousAddress: req.body.previousAddress || '',
      reasonForMoving: req.body.reasonForMoving || '',
      petDetails: req.body.petDetails || '',
      vehicleDetails: req.body.vehicleDetails || '',
      specialInstructions: req.body.specialInstructions || '',
      numberOfOccupants: Number(req.body.numberOfOccupants) || 1,
      ...imageUrls,
      additionalAdults,
      emergencyContact,
      reference,
      organizationId: req.user.organizationId,
      createdBy: req.user._id
    };

    console.log('Creating tenant with data:', { 
      name: tenantData.name, 
      propertyId: tenantData.propertyId, 
      unit: tenantData.unit,
      additionalAdults: additionalAdults.length,
      imageUrls: Object.keys(imageUrls),
      hasImage: !!(imageUrls.imageUrl || imageUrls.tenantImage)
    });
    
    const tenant = await Tenant.create(tenantData);
    
    // Trigger action chain (with error handling)
    try {
      await actionChainService.onTenantAdded(tenant, req.user._id, req.user.organizationId);
    } catch (actionError) {
      console.error('Action chain error (non-critical):', actionError);
      // Don't fail the request if action chain fails
    }
    
    res.status(201).json({ success: true, data: tenant });
  } catch (error: any) {
    console.error('Create tenant error:', error);
    
    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      return res.status(400).json({ 
        success: false, 
        message: `A tenant with this ${field} already exists` 
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        success: false, 
        message: `Validation error: ${validationErrors.join(', ')}` 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to create tenant',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getTenantById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tenant = await Tenant.findById(req.params.id).populate('propertyId', 'name');
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

    // Handle image uploads
    const imageUrls: any = {};
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (files) {
      try {
        const { uploadToCloudinary, isCloudinaryConfigured } = await import('../utils/cloudinary');
        
        if (isCloudinaryConfigured()) {
          for (const [fieldname, fileArray] of Object.entries(files)) {
            if (fileArray && fileArray[0]) {
              const file = fileArray[0];
              try {
                const cloudinaryUrl = await uploadToCloudinary(file, 'tenants');
                imageUrls[fieldname] = cloudinaryUrl;
                if (fieldname === 'tenantImage') {
                  imageUrls.imageUrl = cloudinaryUrl;
                }
              } catch (uploadError) {
                console.error(`Failed to upload ${fieldname}:`, uploadError);
              }
            }
          }
        } else {
          for (const [fieldname, fileArray] of Object.entries(files)) {
            if (fileArray && fileArray[0]) {
              const file = fileArray[0];
              const localUrl = `/uploads/images/${file.filename}`;
              imageUrls[fieldname] = localUrl;
              if (fieldname === 'tenantImage') {
                imageUrls.imageUrl = localUrl;
              }
            }
          }
        }
      } catch (error) {
        console.error('Image upload error:', error);
      }
    }

    // Handle additional adults with images
    let additionalAdults = [];
    if (req.body.additionalAdults) {
      try {
        const parsed = JSON.parse(req.body.additionalAdults);
        additionalAdults = Array.isArray(parsed) ? parsed.map((adult, index) => ({
          ...adult,
          imageUrl: imageUrls[`additionalAdultImage_${index}`] || adult.imageUrl || '',
          govtIdImageUrl: imageUrls[`additionalAdultGovtId_${index}`] || adult.govtIdImageUrl || ''
        })) : [];
      } catch (e) {
        console.error('Failed to parse additional adults:', e);
        additionalAdults = tenant.additionalAdults || [];
      }
    }

    const updateData = {
      ...req.body,
      ...imageUrls,
      additionalAdults
    };

    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('propertyId', 'name');

    res.status(200).json({ success: true, data: updatedTenant });
  } catch (error) {
    console.error('Update tenant error:', error);
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

    // Store tenant info for logging before deletion
    const tenantInfo = {
      name: tenant.name,
      email: tenant.email,
      unit: tenant.unit,
      propertyId: tenant.propertyId
    };

    await tenant.deleteOne();
    
    // Log the deletion
    try {
      const AuditLog = await import('../models/AuditLog');
      await AuditLog.default.create({
        userId: req.user._id,
        organizationId: req.user.organizationId,
        action: 'tenant_deleted',
        resource: 'tenant',
        resourceId: req.params.id,
        details: tenantInfo,
        timestamp: new Date()
      });
    } catch (actionError) {
      console.error('Audit log error (non-critical):', actionError);
    }

    res.status(200).json({ 
      success: true, 
      data: {},
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Delete tenant error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete tenant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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

    // Calculate behavioral insights
    const totalPayments = payments.length;
    const onTimePayments = payments.filter((p: any) => {
      const paymentDate = new Date(p.paymentDate);
      const expectedDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
      return paymentDate.getTime() <= expectedDate.getTime() + (5 * 24 * 60 * 60 * 1000); // 5 days grace
    }).length;
    
    const paymentScore = totalPayments > 0 ? Math.round((onTimePayments / totalPayments) * 100) : 100;
    const avgDaysLate = totalPayments > 0 ? 
      payments.reduce((sum: number, p: any) => {
        const paymentDate = new Date(p.paymentDate);
        const expectedDate = new Date(paymentDate.getFullYear(), paymentDate.getMonth(), 1);
        const daysLate = Math.max(0, Math.floor((paymentDate.getTime() - expectedDate.getTime()) / (1000 * 60 * 60 * 24)));
        return sum + daysLate;
      }, 0) / totalPayments : 0;

    res.status(200).json({
      success: true,
      data: {
        monthlyPayments: monthlyData,
        totalRevenue: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
        paymentCount: payments.length,
        paymentScore,
        avgDaysLate: Math.round(avgDaysLate),
        maintenanceRequests: maintenance.length,
        behaviorInsights: {
          punctuality: paymentScore,
          responsiveness: paymentScore > 80 ? 'High' : paymentScore > 60 ? 'Medium' : 'Low',
          riskLevel: paymentScore > 80 ? 'Low' : paymentScore > 60 ? 'Medium' : 'High'
        }
      }
    });
  } catch (error) {
    console.error('Tenant analytics error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const archiveTenant = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tenant = await Tenant.findById(req.params.id);
    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Toggle archive status
    const newStatus = tenant.status === 'Archived' ? 'Active' : 'Archived';
    const updatedTenant = await Tenant.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true }
    );

    // Log the action
    try {
      const AuditLog = await import('../models/AuditLog');
      await AuditLog.default.create({
        userId: req.user._id,
        organizationId: req.user.organizationId,
        action: newStatus === 'Archived' ? 'tenant_archived' : 'tenant_restored',
        resource: 'tenant',
        resourceId: req.params.id,
        details: {
          tenantName: tenant.name,
          previousStatus: tenant.status,
          newStatus
        },
        timestamp: new Date()
      });
    } catch (actionError) {
      console.error('Audit log error (non-critical):', actionError);
    }

    res.status(200).json({ 
      success: true, 
      data: updatedTenant,
      message: `Tenant ${newStatus === 'Archived' ? 'archived' : 'restored'} successfully`
    });
  } catch (error) {
    console.error('Archive tenant error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const downloadTenantPDF = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tenant = await Tenant.findById(req.params.id).populate('propertyId', 'name');
    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Fetch related data
    const [Payment, Receipt, Expense, MaintenanceRequest] = await Promise.all([
      import('../models/Payment'),
      import('../models/Receipt'), 
      import('../models/Expense'),
      import('../models/MaintenanceRequest')
    ]);

    const [payments, receipts, expenses, maintenance] = await Promise.all([
      Payment.default.find({ tenantId: req.params.id, organizationId: req.user.organizationId }).sort({ paymentDate: -1 }).lean(),
      Receipt.default.find({ tenantId: req.params.id, organizationId: req.user.organizationId }).sort({ createdAt: -1 }).lean(),
      Expense.default.find({ propertyId: tenant.propertyId, organizationId: req.user.organizationId }).sort({ date: -1 }).limit(10).lean(),
      MaintenanceRequest.default.find({ tenantId: req.params.id, organizationId: req.user.organizationId }).sort({ createdAt: -1 }).lean()
    ]);

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}-comprehensive-report.pdf"`);
    
    doc.pipe(res);
    
    // Professional Header with Colors
    doc.rect(0, 0, doc.page.width, 80).fill('#2563eb');
    doc.fontSize(28).fillColor('#ffffff').text('TENANT COMPREHENSIVE REPORT', 40, 25, { align: 'center' });
    doc.fontSize(12).text('Property Management System', 40, 55, { align: 'center' });
    
    // Reset position and color
    doc.y = 100;
    doc.fillColor('#000000');
    
    // Tenant Overview Section
    doc.fontSize(18).fillColor('#2563eb').text('TENANT OVERVIEW', { underline: true });
    doc.moveDown(0.5);
    
    // Two-column layout for basic info
    const leftColumn = 60;
    const rightColumn = 320;
    let currentY = doc.y;
    
    doc.fontSize(12).fillColor('#000000');
    doc.text('Full Name:', leftColumn, currentY, { continued: true }).font('Helvetica-Bold').text(` ${tenant.name}`);
    doc.font('Helvetica').text('Email:', leftColumn, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${tenant.email}`);
    doc.font('Helvetica').text('Phone:', leftColumn, currentY + 40, { continued: true }).font('Helvetica-Bold').text(` ${tenant.phone}`);
    doc.font('Helvetica').text('Status:', leftColumn, currentY + 60, { continued: true }).font('Helvetica-Bold').fillColor(tenant.status === 'Active' ? '#16a34a' : '#dc2626').text(` ${tenant.status}`);
    
    doc.fillColor('#000000').font('Helvetica');
    doc.text('Property:', rightColumn, currentY, { continued: true }).font('Helvetica-Bold').text(` ${(tenant.propertyId as any)?.name || 'N/A'}`);
    doc.font('Helvetica').text('Unit Number:', rightColumn, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${tenant.unit}`);
    doc.font('Helvetica').text('Monthly Rent:', rightColumn, currentY + 40, { continued: true }).font('Helvetica-Bold').fillColor('#16a34a').text(` $${tenant.rentAmount || 0}`);
    doc.fillColor('#000000').font('Helvetica').text('Security Deposit:', rightColumn, currentY + 60, { continued: true }).font('Helvetica-Bold').text(` $${tenant.securityDeposit || 0}`);
    
    doc.y = currentY + 100;
    doc.moveDown();
    
    // Lease Information
    doc.fontSize(16).fillColor('#2563eb').text('LEASE INFORMATION', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#000000');
    
    if (tenant.leaseStartDate) {
      doc.text(`Lease Start: ${new Date(tenant.leaseStartDate).toLocaleDateString()}`);
    }
    if (tenant.leaseEndDate) {
      const daysRemaining = Math.ceil((new Date(tenant.leaseEndDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      doc.text(`Lease End: ${new Date(tenant.leaseEndDate).toLocaleDateString()}`);
      doc.text(`Days Remaining: ${daysRemaining > 0 ? daysRemaining : 'Expired'} days`, { fillColor: daysRemaining < 30 ? '#dc2626' : '#000000' });
    }
    doc.text(`Lease Duration: ${tenant.leaseDuration || 12} months`);
    doc.moveDown();
    
    // Payment Analysis
    doc.fontSize(16).fillColor('#2563eb').text('PAYMENT ANALYSIS', { underline: true });
    doc.moveDown(0.5);
    
    const totalPaid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthPayments = payments.filter((p: any) => {
      const paymentDate = new Date(p.paymentDate);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });
    const currentMonthPaid = currentMonthPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
    const outstandingAmount = (tenant.rentAmount || 0) - currentMonthPaid;
    
    doc.fontSize(12);
    doc.text(`Total Payments Made: ${payments.length}`);
    doc.text(`Total Amount Paid: $${totalPaid}`, { fillColor: '#16a34a' });
    doc.text(`Current Month Paid: $${currentMonthPaid}`);
    doc.text(`Outstanding Amount: $${Math.max(0, outstandingAmount)}`, { fillColor: outstandingAmount > 0 ? '#dc2626' : '#16a34a' });
    doc.text(`Average Monthly Payment: $${payments.length > 0 ? Math.round(totalPaid / payments.length) : 0}`);
    doc.moveDown();
    
    // Recent Payments (Last 5)
    if (payments.length > 0) {
      doc.fontSize(14).fillColor('#2563eb').text('RECENT PAYMENTS', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10);
      
      // Table header
      doc.rect(40, doc.y, 515, 20).fill('#f3f4f6');
      doc.fillColor('#000000').text('Date', 50, doc.y + 5);
      doc.text('Amount', 150, doc.y + 5);
      doc.text('Method', 250, doc.y + 5);
      doc.text('Status', 350, doc.y + 5);
      doc.text('Month', 450, doc.y + 5);
      doc.y += 25;
      
      payments.slice(0, 5).forEach((payment: any, index: number) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.rect(40, doc.y - 2, 515, 18).fill(bgColor);
        doc.fillColor('#000000');
        doc.text(new Date(payment.paymentDate).toLocaleDateString(), 50, doc.y + 2);
        doc.text(`$${payment.amount}`, 150, doc.y + 2);
        doc.text(payment.paymentMethod || 'N/A', 250, doc.y + 2);
        doc.fillColor(payment.status === 'Paid' ? '#16a34a' : '#dc2626').text(payment.status, 350, doc.y + 2);
        doc.fillColor('#000000').text(payment.rentMonth || 'N/A', 450, doc.y + 2);
        doc.y += 18;
      });
      doc.moveDown();
    }
    
    // Maintenance Analysis
    if (maintenance.length > 0) {
      doc.fontSize(16).fillColor('#2563eb').text('MAINTENANCE ANALYSIS', { underline: true });
      doc.moveDown(0.5);
      
      const openRequests = maintenance.filter((m: any) => m.status === 'Open').length;
      const closedRequests = maintenance.filter((m: any) => m.status === 'Closed').length;
      const totalCost = maintenance.reduce((sum: number, m: any) => sum + (m.cost || 0), 0);
      
      doc.fontSize(12);
      doc.text(`Total Maintenance Requests: ${maintenance.length}`);
      doc.text(`Open Requests: ${openRequests}`, { fillColor: openRequests > 0 ? '#dc2626' : '#16a34a' });
      doc.text(`Closed Requests: ${closedRequests}`, { fillColor: '#16a34a' });
      doc.text(`Total Maintenance Cost: $${totalCost}`);
      doc.moveDown();
      
      // Recent maintenance requests
      doc.fontSize(14).fillColor('#2563eb').text('RECENT MAINTENANCE REQUESTS', { underline: true });
      doc.moveDown(0.3);
      doc.fontSize(10);
      
      maintenance.slice(0, 5).forEach((request: any, index: number) => {
        const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
        doc.rect(40, doc.y - 2, 515, 25).fill(bgColor);
        doc.fillColor('#000000');
        doc.text(`${new Date(request.createdAt).toLocaleDateString()} - `, 50, doc.y + 2, { continued: true });
        doc.fillColor(request.status === 'Open' ? '#dc2626' : '#16a34a').text(request.status, { continued: true });
        doc.fillColor('#000000').text(` - ${request.description?.substring(0, 60)}${request.description?.length > 60 ? '...' : ''}`, 50, doc.y + 12);
        doc.y += 25;
      });
      doc.moveDown();
    }
    
    // Personal Details (if available)
    if (tenant.fatherName || tenant.motherName || tenant.presentAddress) {
      doc.fontSize(16).fillColor('#2563eb').text('PERSONAL DETAILS', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#000000');
      
      if (tenant.fatherName) doc.text(`Father's Name: ${tenant.fatherName}`);
      if (tenant.motherName) doc.text(`Mother's Name: ${tenant.motherName}`);
      if (tenant.govtIdNumber) doc.text(`Government ID: ${tenant.govtIdNumber}`);
      if (tenant.presentAddress) doc.text(`Present Address: ${tenant.presentAddress}`);
      if (tenant.permanentAddress) doc.text(`Permanent Address: ${tenant.permanentAddress}`);
      if (tenant.occupation) doc.text(`Occupation: ${tenant.occupation}`);
      if (tenant.monthlyIncome) doc.text(`Monthly Income: $${tenant.monthlyIncome}`);
      doc.moveDown();
    }
    
    // Emergency Contact
    if (tenant.emergencyContact?.name) {
      doc.fontSize(16).fillColor('#2563eb').text('EMERGENCY CONTACT', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#000000');
      
      const emergencyName = tenant.emergencyContact?.name;
      const emergencyPhone = tenant.emergencyContact?.phone;
      const emergencyRelation = tenant.emergencyContact?.relation;
      
      if (emergencyName) doc.text(`Name: ${emergencyName}`);
      if (emergencyPhone) doc.text(`Phone: ${emergencyPhone}`);
      if (emergencyRelation) doc.text(`Relationship: ${emergencyRelation}`);
      doc.moveDown();
    }
    
    // Additional Information
    if (tenant.vehicleDetails || tenant.petDetails || tenant.specialInstructions) {
      doc.fontSize(16).fillColor('#2563eb').text('ADDITIONAL INFORMATION', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#000000');
      
      if (tenant.vehicleDetails) doc.text(`Vehicle Details: ${tenant.vehicleDetails}`);
      if (tenant.petDetails) doc.text(`Pet Details: ${tenant.petDetails}`);
      if (tenant.numberOfOccupants) doc.text(`Number of Occupants: ${tenant.numberOfOccupants}`);
      if (tenant.specialInstructions) {
        doc.text('Special Instructions:', { continued: false });
        doc.text(tenant.specialInstructions, { width: 500 });
      }
      doc.moveDown();
    }
    
    // Footer
    doc.fontSize(8).fillColor('#6b7280');
    const footerY = doc.page.height - 60;
    doc.text('This document contains confidential tenant information. Unauthorized distribution is prohibited.', 40, footerY, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 40, footerY + 15, { align: 'center' });
    doc.text('Property Management System - Professional Tenant Management Solution', 40, footerY + 30, { align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};

export const downloadTenantDataZip = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tenant = await Tenant.findById(req.params.id).populate('propertyId', 'name');
    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}-complete-data.zip"`);
    
    archive.pipe(res);
    
    // Add tenant images if they exist
    const imageUrls = [
      { url: tenant.tenantImage || tenant.imageUrl, name: 'tenant-photo.jpg' },
      { url: tenant.govtIdFront, name: 'government-id-front.jpg' },
      { url: tenant.govtIdBack, name: 'government-id-back.jpg' }
    ];
    
    // Add additional adult images
    if (tenant.additionalAdults) {
      tenant.additionalAdults.forEach((adult: any, index: number) => {
        if (adult.imageUrl || adult.image) {
          imageUrls.push({ url: adult.imageUrl || adult.image, name: `adult-${index + 1}-photo.jpg` });
        }
      });
    }
    
    // Download and add images to zip
    for (const img of imageUrls) {
      if (img.url) {
        try {
          const axios = require('axios');
          const response = await axios.get(img.url, { responseType: 'stream' });
          archive.append(response.data, { name: `images/${img.name}` });
        } catch (error) {
          console.error(`Failed to download image ${img.url}:`, error);
        }
      }
    }
    
    // Add uploaded documents
    if (tenant.documents && tenant.documents.length > 0) {
      for (const doc of tenant.documents) {
        try {
          const axios = require('axios');
          const response = await axios.get(doc.url, { responseType: 'stream' });
          archive.append(response.data, { name: `documents/${doc.filename || 'document.pdf'}` });
        } catch (error) {
          console.error(`Failed to download document ${doc.url}:`, error);
        }
      }
    }
    
    // Add uploaded images
    if (tenant.uploadedImages && tenant.uploadedImages.length > 0) {
      for (const img of tenant.uploadedImages) {
        try {
          const axios = require('axios');
          const response = await axios.get(img.url, { responseType: 'stream' });
          archive.append(response.data, { name: `uploaded-images/${img.description || 'image'}.jpg` });
        } catch (error) {
          console.error(`Failed to download uploaded image ${img.url}:`, error);
        }
      }
    }
    
    // Generate and add comprehensive PDF
    const PDFDocument = require('pdfkit');
    const pdfDoc = new PDFDocument({ margin: 40, size: 'A4' });
    
    // Create PDF content (simplified version)
    pdfDoc.fontSize(20).text('COMPLETE TENANT INFORMATION', { align: 'center' });
    pdfDoc.moveDown();
    pdfDoc.fontSize(14).text(`Name: ${tenant.name}`);
    pdfDoc.text(`Email: ${tenant.email}`);
    pdfDoc.text(`Phone: ${tenant.phone}`);
    pdfDoc.text(`Property: ${(tenant.propertyId as any)?.name || 'N/A'}`);
    pdfDoc.text(`Unit: ${tenant.unit}`);
    pdfDoc.text(`Monthly Rent: $${tenant.rentAmount || 0}`);
    
    if (tenant.fatherName) pdfDoc.text(`Father's Name: ${tenant.fatherName}`);
    if (tenant.motherName) pdfDoc.text(`Mother's Name: ${tenant.motherName}`);
    if (tenant.presentAddress) pdfDoc.text(`Present Address: ${tenant.presentAddress}`);
    if (tenant.permanentAddress) pdfDoc.text(`Permanent Address: ${tenant.permanentAddress}`);
    
    pdfDoc.end();
    archive.append(pdfDoc, { name: 'tenant-complete-info.pdf' });
    
    // Create a summary text file
    const summaryText = `
TENANT SUMMARY
==============
Name: ${tenant.name}
Email: ${tenant.email}
Phone: ${tenant.phone}
Property: ${(tenant.propertyId as any)?.name || 'N/A'}
Unit: ${tenant.unit}
Status: ${tenant.status}
Monthly Rent: $${tenant.rentAmount || 0}
Security Deposit: $${tenant.securityDeposit || 0}
Lease Start: ${tenant.leaseStartDate ? new Date(tenant.leaseStartDate).toLocaleDateString() : 'N/A'}
Lease End: ${tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'N/A'}

Generated on: ${new Date().toLocaleString()}
`;
    
    archive.append(summaryText, { name: 'tenant-summary.txt' });
    
    archive.finalize();
  } catch (error) {
    console.error('Zip generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate zip file' });
  }
};

export const bulkTenantActions = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !user.organizationId) {
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
  }

  try {
    const { action, tenantIds, data } = req.body;

    if (!action || !tenantIds || !Array.isArray(tenantIds)) {
      res.status(400).json({ success: false, message: 'Invalid request data' });
      return;
    }

    // Verify all tenants belong to the organization
    const tenants = await Tenant.find({
      _id: { $in: tenantIds },
      organizationId: user.organizationId
    });

    if (tenants.length !== tenantIds.length) {
      res.status(403).json({ success: false, message: 'Some tenants not found or not authorized' });
      return;
    }

    let results = [];

    switch (action) {
      case 'rent_increase':
        for (const tenant of tenants) {
          const oldAmount = tenant.rentAmount || 0;
          const newAmount = data.type === 'percentage' 
            ? oldAmount * (1 + (data.value / 100))
            : oldAmount + data.value;
          
          await Tenant.findByIdAndUpdate(tenant._id, {
            rentAmount: Math.round(newAmount),
            lastRentIncrease: {
              date: new Date(data.effectiveDate || Date.now()),
              oldAmount,
              newAmount: Math.round(newAmount),
              type: data.type,
              value: data.value,
              reason: data.reason || 'Bulk rent increase'
            }
          });
          
          results.push({ tenantId: tenant._id, oldAmount, newAmount: Math.round(newAmount) });
        }
        break;

      case 'lease_renewal':
        // Create lease renewal records or send notifications
        for (const tenant of tenants) {
          // This would typically create renewal notices or update lease terms
          results.push({ tenantId: tenant._id, status: 'renewal_notice_sent' });
        }
        break;

      case 'payment_reminder':
      case 'late_notice':
        // Send notifications (would integrate with email/SMS service)
        for (const tenant of tenants) {
          results.push({ tenantId: tenant._id, status: 'notification_sent' });
        }
        break;

      case 'archive_tenants':
        await Tenant.updateMany(
          { _id: { $in: tenantIds } },
          { status: 'Archived' }
        );
        results = tenantIds.map(id => ({ tenantId: id, status: 'archived' }));
        break;

      default:
        res.status(400).json({ success: false, message: 'Unknown action' });
        return;
    }

    // Log the bulk action
    try {
      const AuditLog = await import('../models/AuditLog');
      await AuditLog.default.create({
        userId: user._id,
        organizationId: user.organizationId,
        action: `bulk_${action}`,
        resource: 'tenant',
        details: {
          tenantCount: tenantIds.length,
          action,
          data,
          results
        },
        timestamp: new Date()
      });
    } catch (logError) {
      console.error('Audit log error (non-critical):', logError);
    }

    res.status(200).json({
      success: true,
      data: {
        action,
        processedCount: results.length,
        results
      },
      message: `Bulk ${action} completed successfully`
    });
  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const downloadPersonalDetailsPDF = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const tenant = await Tenant.findById(req.params.id).populate('propertyId', 'name');
    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${tenant.name.replace(/[^a-zA-Z0-9]/g, '_')}-personal-details.pdf"`);
    
    doc.pipe(res);
    
    // Professional Header with Gradient Background
    doc.rect(0, 0, doc.page.width, 100).fill('#1e40af');
    doc.fontSize(32).fillColor('#ffffff').text('PERSONAL DETAILS', 40, 20, { align: 'center' });
    doc.fontSize(16).text('CONFIDENTIAL TENANT INFORMATION', 40, 55, { align: 'center' });
    doc.fontSize(10).text('Authorized Personnel Only', 40, 75, { align: 'center' });
    
    // Watermark
    doc.fontSize(60).fillColor('#f3f4f6').text('CONFIDENTIAL', 0, 300, {
      align: 'center',
      angle: -45,
      opacity: 0.1
    });
    
    // Reset position and color
    doc.y = 120;
    doc.fillColor('#000000');
    
    // Tenant Photo Section (placeholder)
    doc.fontSize(18).fillColor('#1e40af').text('TENANT IDENTIFICATION', { underline: true });
    doc.moveDown(0.5);
    
    // Photo placeholder box
    doc.rect(40, doc.y, 120, 150).stroke('#d1d5db');
    doc.fontSize(10).fillColor('#6b7280').text('TENANT PHOTO', 70, doc.y + 70, { align: 'center' });
    doc.text('(Upload Required)', 70, doc.y + 85, { align: 'center' });
    
    // Basic Information beside photo
    const photoRightX = 180;
    const basicInfoY = doc.y - 150;
    
    doc.fontSize(14).fillColor('#1e40af').text('BASIC INFORMATION', photoRightX, basicInfoY, { underline: true });
    doc.fontSize(12).fillColor('#000000');
    doc.text(`Full Name: ${tenant.name}`, photoRightX, basicInfoY + 25);
    doc.text(`Email: ${tenant.email}`, photoRightX, basicInfoY + 45);
    doc.text(`Phone: ${tenant.phone}`, photoRightX, basicInfoY + 65);
    if (tenant.whatsappNumber) {
      doc.text(`WhatsApp: ${tenant.whatsappNumber}`, photoRightX, basicInfoY + 85);
    }
    doc.text(`Status: ${tenant.status}`, photoRightX, basicInfoY + 105, {
      fillColor: tenant.status === 'Active' ? '#16a34a' : '#dc2626'
    });
    
    doc.y = basicInfoY + 170;
    doc.moveDown();
    
    // Property Information
    doc.fontSize(16).fillColor('#1e40af').text('PROPERTY INFORMATION', { underline: true });
    doc.moveDown(0.5);
    
    // Property info in two columns
    const leftCol = 60;
    const rightCol = 320;
    let currentY = doc.y;
    
    doc.fontSize(12).fillColor('#000000');
    doc.text('Property:', leftCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${(tenant.propertyId as any)?.name || 'N/A'}`);
    doc.font('Helvetica').text('Unit Number:', leftCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${tenant.unit}`);
    doc.font('Helvetica').text('Monthly Rent:', rightCol, currentY, { continued: true }).font('Helvetica-Bold').fillColor('#16a34a').text(` $${tenant.rentAmount || 0}`);
    doc.fillColor('#000000').font('Helvetica').text('Security Deposit:', rightCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` $${tenant.securityDeposit || 0}`);
    
    if (tenant.leaseStartDate) {
      doc.text('Lease Start:', leftCol, currentY + 40, { continued: true }).font('Helvetica-Bold').text(` ${new Date(tenant.leaseStartDate).toLocaleDateString()}`);
    }
    if (tenant.leaseEndDate) {
      doc.font('Helvetica').text('Lease End:', rightCol, currentY + 40, { continued: true }).font('Helvetica-Bold').text(` ${new Date(tenant.leaseEndDate).toLocaleDateString()}`);
    }
    
    doc.y = currentY + 80;
    doc.moveDown();
    
    // Family Details
    doc.fontSize(16).fillColor('#1e40af').text('FAMILY DETAILS', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#000000').font('Helvetica');
    
    currentY = doc.y;
    if (tenant.fatherName) {
      doc.text('Father\'s Name:', leftCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${tenant.fatherName}`);
    }
    if (tenant.motherName) {
      doc.font('Helvetica').text('Mother\'s Name:', rightCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${tenant.motherName}`);
    }
    if (tenant.govtIdNumber) {
      doc.font('Helvetica').text('Government ID:', leftCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${tenant.govtIdNumber}`);
    }
    if (tenant.occupation) {
      doc.font('Helvetica').text('Occupation:', rightCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${tenant.occupation}`);
    }
    if (tenant.monthlyIncome) {
      doc.font('Helvetica').text('Monthly Income:', leftCol, currentY + 40, { continued: true }).font('Helvetica-Bold').fillColor('#16a34a').text(` $${tenant.monthlyIncome}`);
    }
    
    doc.y = currentY + 80;
    doc.moveDown();
    
    // Address Information
    doc.fontSize(16).fillColor('#1e40af').text('ADDRESS INFORMATION', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('#000000').font('Helvetica');
    
    if (tenant.presentAddress) {
      doc.text('Present Address:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.presentAddress}`, { width: 500 });
      doc.moveDown(0.3);
    }
    if (tenant.permanentAddress) {
      doc.font('Helvetica').text('Permanent Address:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.permanentAddress}`, { width: 500 });
      doc.moveDown(0.3);
    }
    if (tenant.previousAddress) {
      doc.font('Helvetica').text('Previous Address:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.previousAddress}`, { width: 500 });
      doc.moveDown(0.3);
    }
    doc.moveDown();
    
    // Emergency Contact
    const emergencyName = tenant.emergencyContact?.name;
    const emergencyPhone = tenant.emergencyContact?.phone;
    const emergencyRelation = tenant.emergencyContact?.relation;
    
    if (emergencyName || emergencyPhone) {
      doc.fontSize(16).fillColor('#1e40af').text('EMERGENCY CONTACT', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#000000').font('Helvetica');
      
      currentY = doc.y;
      if (emergencyName) {
        doc.text('Contact Name:', leftCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${emergencyName}`);
      }
      if (emergencyPhone) {
        doc.font('Helvetica').text('Phone Number:', rightCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${emergencyPhone}`);
      }
      if (emergencyRelation) {
        doc.font('Helvetica').text('Relationship:', leftCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${emergencyRelation}`);
      }
      
      doc.y = currentY + 60;
      doc.moveDown();
    }
    
    // Reference Information
    if (tenant.reference?.name) {
      doc.fontSize(16).fillColor('#1e40af').text('REFERENCE INFORMATION', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#000000').font('Helvetica');
      
      const refName = tenant.reference?.name;
      const refPhone = tenant.reference?.phone;
      const refEmail = tenant.reference?.email;
      const refRelation = tenant.reference?.relation;
      const refAddress = tenant.reference?.address;
      
      currentY = doc.y;
      if (refName) {
        doc.text('Reference Name:', leftCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${refName}`);
      }
      if (refPhone) {
        doc.font('Helvetica').text('Phone:', rightCol, currentY, { continued: true }).font('Helvetica-Bold').text(` ${refPhone}`);
      }
      if (refEmail) {
        doc.font('Helvetica').text('Email:', leftCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${refEmail}`);
      }
      if (refRelation) {
        doc.font('Helvetica').text('Relation:', rightCol, currentY + 20, { continued: true }).font('Helvetica-Bold').text(` ${refRelation}`);
      }
      if (refAddress) {
        doc.font('Helvetica').text('Address:', leftCol, currentY + 40, { continued: true }).font('Helvetica-Bold').text(` ${refAddress}`, { width: 400 });
      }
      
      doc.y = currentY + 80;
      doc.moveDown();
    }
    
    // Additional Information
    if (tenant.vehicleDetails || tenant.petDetails || tenant.specialInstructions || tenant.numberOfOccupants) {
      doc.fontSize(16).fillColor('#1e40af').text('ADDITIONAL INFORMATION', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12).fillColor('#000000').font('Helvetica');
      
      if (tenant.numberOfOccupants) {
        doc.text('Number of Occupants:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.numberOfOccupants}`);
      }
      if (tenant.vehicleDetails) {
        doc.font('Helvetica').text('Vehicle Details:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.vehicleDetails}`);
      }
      if (tenant.petDetails) {
        doc.font('Helvetica').text('Pet Details:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.petDetails}`);
      }
      if (tenant.reasonForMoving) {
        doc.font('Helvetica').text('Reason for Moving:', { continued: true }).font('Helvetica-Bold').text(` ${tenant.reasonForMoving}`, { width: 500 });
      }
      if (tenant.specialInstructions) {
        doc.font('Helvetica').text('Special Instructions:', { continued: false });
        doc.font('Helvetica-Bold').text(tenant.specialInstructions, { width: 500 });
      }
      doc.moveDown();
    }
    
    // Additional Adults Information
    if (tenant.additionalAdults && tenant.additionalAdults.length > 0) {
      doc.fontSize(16).fillColor('#1e40af').text('ADDITIONAL OCCUPANTS', { underline: true });
      doc.moveDown(0.5);
      
      tenant.additionalAdults.forEach((adult: any, index: number) => {
        doc.fontSize(14).fillColor('#374151').text(`Adult ${index + 1}:`, { underline: true });
        doc.fontSize(12).fillColor('#000000').font('Helvetica');
        
        if (adult.name) doc.text(`Name: ${adult.name}`);
        if (adult.phone) doc.text(`Phone: ${adult.phone}`);
        if (adult.govtIdNumber) doc.text(`Government ID: ${adult.govtIdNumber}`);
        if (adult.relation) doc.text(`Relation to Main Tenant: ${adult.relation}`);
        doc.moveDown(0.5);
      });
    }
    
    // Security Notice
    doc.rect(40, doc.y, 515, 60).fill('#fef3c7').stroke('#f59e0b');
    doc.fontSize(12).fillColor('#92400e').text('SECURITY NOTICE', 50, doc.y + 10, { align: 'center' });
    doc.fontSize(10).text('This document contains sensitive personal information.', 50, doc.y + 25, { align: 'center' });
    doc.text('Handle with care and dispose of securely when no longer needed.', 50, doc.y + 40, { align: 'center' });
    
    doc.y += 80;
    doc.moveDown();
    
    // Professional Footer
    doc.fontSize(8).fillColor('#6b7280');
    const footerY = doc.page.height - 80;
    doc.rect(0, footerY - 10, doc.page.width, 90).fill('#f9fafb');
    doc.text('CONFIDENTIAL DOCUMENT - AUTHORIZED PERSONNEL ONLY', 40, footerY, { align: 'center' });
    doc.text('This document contains confidential tenant information protected by privacy laws.', 40, footerY + 15, { align: 'center' });
    doc.text('Unauthorized access, distribution, or disclosure is strictly prohibited.', 40, footerY + 30, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 40, footerY + 50, { align: 'center' });
    doc.text('Property Management System - Professional Tenant Management Solution', 40, footerY + 65, { align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error('Personal details PDF generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate personal details PDF' });
  }
};