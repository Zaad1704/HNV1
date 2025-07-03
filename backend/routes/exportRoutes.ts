import { Router } from 'express';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import Expense from '../models/Expense';

const router = Router();

// Export properties
router.post('/properties', asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.organizationId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { format, filters } = req.body;
  const query: any = { organizationId: req.user.organizationId };
  
  if (filters?.ids) {
    query._id = { $in: filters.ids };
  }

  const properties = await Property.find(query).populate('createdBy', 'name');
  
  if (format === 'csv') {
    const csvData = [
      ['Name', 'Address', 'Units', 'Status', 'Created By', 'Created Date'],
      ...properties.map(p => [
        p.name,
        p.address.formattedAddress || '',
        p.numberOfUnits.toString(),
        p.status,
        (p.createdBy as any)?.name || '',
        p.createdAt.toISOString().split('T')[0]
      ])
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=properties.csv');
    res.send(csvData);
  } else {
    res.json({ success: true, data: properties });
  }
}));

// Export tenants
router.post('/tenants', asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.organizationId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { format, filters } = req.body;
  const query: any = { organizationId: req.user.organizationId };
  
  if (filters?.ids) {
    query._id = { $in: filters.ids };
  }

  const tenants = await Tenant.find(query).populate('propertyId', 'name');
  
  if (format === 'csv') {
    const csvData = [
      ['Name', 'Email', 'Phone', 'Property', 'Unit', 'Rent Amount', 'Status', 'Lease End'],
      ...tenants.map(t => [
        t.name,
        t.email,
        t.phone || '',
        (t.propertyId as any)?.name || '',
        t.unit,
        t.rentAmount?.toString() || '0',
        t.status,
        t.leaseEndDate ? t.leaseEndDate.toISOString().split('T')[0] : ''
      ])
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=tenants.csv');
    res.send(csvData);
  } else {
    res.json({ success: true, data: tenants });
  }
}));

// Export payments
router.post('/payments', asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.organizationId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { format, filters } = req.body;
  const query: any = { organizationId: req.user.organizationId };
  
  if (filters?.ids) {
    query._id = { $in: filters.ids };
  }

  const payments = await Payment.find(query)
    .populate('tenantId', 'name')
    .populate('propertyId', 'name');
  
  if (format === 'csv') {
    const csvData = [
      ['Transaction ID', 'Tenant', 'Property', 'Amount', 'Date', 'Status'],
      ...payments.map(p => [
        p.transactionId || p._id.toString(),
        (p.tenantId as any)?.name || '',
        (p.propertyId as any)?.name || '',
        p.amount.toString(),
        p.paymentDate.toISOString().split('T')[0],
        p.status
      ])
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=payments.csv');
    res.send(csvData);
  } else {
    res.json({ success: true, data: payments });
  }
}));

// Export expenses
router.post('/expenses', asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.organizationId) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { format, filters } = req.body;
  const query: any = { organizationId: req.user.organizationId };
  
  if (filters?.ids) {
    query._id = { $in: filters.ids };
  }

  const expenses = await Expense.find(query)
    .populate('propertyId', 'name')
    .populate('recordedBy', 'name');
  
  if (format === 'csv') {
    const csvData = [
      ['Description', 'Category', 'Amount', 'Property', 'Date', 'Recorded By'],
      ...expenses.map(e => [
        e.description,
        e.category,
        e.amount.toString(),
        (e.propertyId as any)?.name || '',
        e.date.toISOString().split('T')[0],
        (e as any).recordedBy?.name || ''
      ])
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(csvData);
  } else {
    res.json({ success: true, data: expenses });
  }
}));

export default router;