import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import rentCollectionService from '../services/rentCollectionService';
import RentCollectionPeriod from '../models/RentCollectionPeriod';
import CollectionAction from '../models/CollectionAction';
import CollectionSheet from '../models/CollectionSheet';
import path from 'path';

export const getCollectionPeriod = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { year, month } = req.params;
  const organizationId = req.user!.organizationId.toString();

  const yearNum = parseInt(year);
  const monthNum = parseInt(month);

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    res.status(400).json({
      success: false,
      message: 'Invalid year or month'
    });
    return;
  }

  let period = await RentCollectionPeriod.findOne({
    organizationId,
    'period.year': yearNum,
    'period.month': monthNum
  });

  if (!period) {
    // Generate new period
    period = await rentCollectionService.generateCollectionPeriod(organizationId, yearNum, monthNum);
  } else {
    // Update existing period if it's older than 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (period.lastUpdated < oneHourAgo) {
      await rentCollectionService.updateCollectionPeriod(period);
    }
  }

  res.json({
    success: true,
    data: period
  });
});

export const generateCollectionPeriod = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { year, month } = req.params;
  const organizationId = req.user!.organizationId.toString();

  const yearNum = parseInt(year);
  const monthNum = parseInt(month);

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    res.status(400).json({
      success: false,
      message: 'Invalid year or month'
    });
    return;
  }

  const period = await rentCollectionService.generateCollectionPeriod(organizationId, yearNum, monthNum);

  res.json({
    success: true,
    data: period
  });
});

export const createCollectionSheet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { periodId } = req.params;
  const options = req.body;

  const period = await RentCollectionPeriod.findOne({
    _id: periodId,
    organizationId: req.user!.organizationId
  });

  if (!period) {
    res.status(404).json({
      success: false,
      message: 'Collection period not found'
    });
    return;
  }

  // Create collection sheet record
  const sheet = new CollectionSheet({
    organizationId: req.user!.organizationId,
    periodId,
    createdBy: req.user!._id,
    format: options.format || {},
    sections: options.sections || {},
    customization: options.customization || {}
  });

  await sheet.save();

  // Generate PDF
  const filePath = await rentCollectionService.generateCollectionSheet(periodId, options);
  const fileName = path.basename(filePath);

  // Update sheet with result
  sheet.result = {
    fileUrl: `/api/rent-collection/sheet/${sheet._id}/download`,
    fileName,
    generatedAt: new Date()
  };

  await sheet.save();

  res.json({
    success: true,
    data: sheet
  });
});

export const downloadCollectionSheet = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const sheet = await CollectionSheet.findOne({
    _id: id,
    organizationId: req.user!.organizationId
  });

  if (!sheet || !sheet.result?.fileName) {
    res.status(404).json({
      success: false,
      message: 'Collection sheet not found'
    });
    return;
  }

  const filePath = path.join(__dirname, '../uploads/collections', sheet.result.fileName);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${sheet.result.fileName}"`);
  res.sendFile(path.resolve(filePath));
});

export const recordCollectionAction = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const actionData = {
    ...req.body,
    userId: req.user!._id,
    organizationId: req.user!.organizationId
  };

  await rentCollectionService.recordCollectionAction(actionData);

  res.json({
    success: true,
    message: 'Collection action recorded successfully'
  });
});

export const getCollectionActions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { tenantId, periodId } = req.query;

  let query: any = {
    organizationId: req.user!.organizationId
  };

  if (tenantId) query.tenantId = tenantId;
  if (periodId) query.periodId = periodId;

  const actions = await CollectionAction.find(query)
    .populate('tenantId', 'name')
    .populate('userId', 'name')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: actions
  });
});

export const getCollectionAnalytics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;
  const organizationId = req.user!.organizationId.toString();

  const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000); // 6 months ago
  const end = endDate ? new Date(endDate as string) : new Date();

  const analytics = await rentCollectionService.getCollectionAnalytics(organizationId, start, end);

  res.json({
    success: true,
    data: analytics
  });
});

export const getOverduePayments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { daysOverdue = 1 } = req.query;
  const organizationId = req.user!.organizationId;

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const period = await RentCollectionPeriod.findOne({
    organizationId,
    'period.year': currentYear,
    'period.month': currentMonth
  });

  if (!period) {
    res.json({
      success: true,
      data: []
    });
    return;
  }

  const overdueTenants = period.tenants.filter(tenant => 
    tenant.status === 'overdue' && tenant.daysLate >= parseInt(daysOverdue as string)
  );

  res.json({
    success: true,
    data: overdueTenants
  });
});

export const updateTenantNotes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { periodId, tenantId } = req.params;
  const { notes } = req.body;

  const period = await RentCollectionPeriod.findOne({
    _id: periodId,
    organizationId: req.user!.organizationId
  });

  if (!period) {
    res.status(404).json({
      success: false,
      message: 'Collection period not found'
    });
    return;
  }

  const tenant = period.tenants.find(t => t.tenantId.toString() === tenantId);
  if (!tenant) {
    res.status(404).json({
      success: false,
      message: 'Tenant not found in collection period'
    });
    return;
  }

  tenant.notes = notes;
  await period.save();

  res.json({
    success: true,
    message: 'Tenant notes updated successfully'
  });
});