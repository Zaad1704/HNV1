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
    
    if (!rentAmount || !leaseStartDate || !leaseEndDate || !securityDeposit) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rent amount, lease dates, and security deposit are required' 
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
              imageUrls[fieldname] = `/uploads/images/${file.filename}`;
            }
          }
        }
      } catch (error) {
        console.error('Image upload error:', error);
        // Continue without failing - images are optional for basic functionality
      }
    }

    // Handle additional adults data
    let additionalAdults = [];
    if (req.body.additionalAdults) {
      try {
        const parsed = JSON.parse(req.body.additionalAdults);
        additionalAdults = Array.isArray(parsed) ? parsed : [];
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
      imageUrls: Object.keys(imageUrls)
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

export const archiveTenant = async (req: AuthRequest, res: Response) => {
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
      { status: 'Archived' },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedTenant });
  } catch (error) {
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

    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${tenant.name}-details.pdf"`);
    
    doc.pipe(res);
    
    // Header
    doc.fontSize(20).text('Tenant Details Report', { align: 'center' });
    doc.moveDown();
    
    // Basic Info
    doc.fontSize(16).text('Basic Information', { underline: true });
    doc.fontSize(12);
    doc.text(`Name: ${tenant.name}`);
    doc.text(`Email: ${tenant.email}`);
    doc.text(`Phone: ${tenant.phone}`);
    doc.text(`Property: ${tenant.propertyId?.name || 'N/A'}`);
    doc.text(`Unit: ${tenant.unit}`);
    doc.text(`Rent: $${tenant.rentAmount}`);
    doc.moveDown();
    
    // Personal Details
    if (tenant.fatherName || tenant.motherName) {
      doc.fontSize(16).text('Personal Details', { underline: true });
      doc.fontSize(12);
      if (tenant.fatherName) doc.text(`Father's Name: ${tenant.fatherName}`);
      if (tenant.motherName) doc.text(`Mother's Name: ${tenant.motherName}`);
      if (tenant.govtIdNumber) doc.text(`ID Number: ${tenant.govtIdNumber}`);
      doc.moveDown();
    }
    
    // Footer
    doc.fontSize(10).text('Generated by Property Management System', { align: 'center' });
    doc.text('All rights reserved', { align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate PDF' });
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
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${tenant.name}-personal-details.pdf"`);
    
    doc.pipe(res);
    
    // Professional Header with Watermark
    doc.fontSize(24).fillColor('#2563eb').text('PERSONAL DETAILS REPORT', { align: 'center' });
    doc.fontSize(12).fillColor('#6b7280').text('Confidential Document', { align: 'center' });
    doc.moveDown(2);
    
    // Tenant Photo placeholder
    doc.fontSize(14).fillColor('#000000').text('TENANT INFORMATION', { underline: true });
    doc.moveDown();
    
    // Basic Information
    doc.fontSize(12);
    doc.text(`Full Name: ${tenant.name}`, { continued: false });
    doc.text(`Email Address: ${tenant.email}`);
    doc.text(`Phone Number: ${tenant.phone}`);
    if (tenant.whatsappNumber) doc.text(`WhatsApp: ${tenant.whatsappNumber}`);
    doc.moveDown();
    
    // Property Information
    doc.fontSize(14).text('PROPERTY INFORMATION', { underline: true });
    doc.fontSize(12);
    doc.text(`Property: ${tenant.propertyId?.name || 'N/A'}`);
    doc.text(`Unit Number: ${tenant.unit}`);
    doc.text(`Monthly Rent: $${tenant.rentAmount}`);
    doc.text(`Security Deposit: $${tenant.securityDeposit || 0}`);
    doc.moveDown();
    
    // Family Details
    if (tenant.fatherName || tenant.motherName) {
      doc.fontSize(14).text('FAMILY DETAILS', { underline: true });
      doc.fontSize(12);
      if (tenant.fatherName) doc.text(`Father's Name: ${tenant.fatherName}`);
      if (tenant.motherName) doc.text(`Mother's Name: ${tenant.motherName}`);
      if (tenant.govtIdNumber) doc.text(`Government ID: ${tenant.govtIdNumber}`);
      doc.moveDown();
    }
    
    // Addresses
    if (tenant.presentAddress || tenant.permanentAddress) {
      doc.fontSize(14).text('ADDRESS INFORMATION', { underline: true });
      doc.fontSize(12);
      if (tenant.presentAddress) doc.text(`Present Address: ${tenant.presentAddress}`);
      if (tenant.permanentAddress) doc.text(`Permanent Address: ${tenant.permanentAddress}`);
      doc.moveDown();
    }
    
    // Emergency Contact
    if (tenant.emergencyContact?.name) {
      doc.fontSize(14).text('EMERGENCY CONTACT', { underline: true });
      doc.fontSize(12);
      doc.text(`Name: ${tenant.emergencyContact.name}`);
      doc.text(`Phone: ${tenant.emergencyContact.phone}`);
      doc.text(`Relation: ${tenant.emergencyContact.relation}`);
      doc.moveDown();
    }
    
    // Professional Footer
    doc.fontSize(8).fillColor('#6b7280');
    doc.text('This document contains confidential information. Unauthorized distribution is prohibited.', { align: 'center' });
    doc.text('Generated by Property Management System - All Rights Reserved', { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
    
    doc.end();
  } catch (error) {
    console.error('Personal details PDF generation error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate personal details PDF' });
  }
};