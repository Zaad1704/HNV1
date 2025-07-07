import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';
import Invoice from '../models/Invoice';
import actionChainService from '../services/actionChainService';

interface AuthRequest extends Request {
  user?: any;
}

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    // Super Admin can access all payments, others need organizationId
    if (!req.user?.organizationId && req.user?.role !== 'Super Admin') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const query = req.user.role === 'Super Admin' && !req.user.organizationId 
      ? {} 
      : { organizationId: req.user.organizationId };

    const payments = await Payment.find(query)
      .populate('tenantId', 'name email')
      .populate('propertyId', 'name address')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 })
      .lean()
      .exec();

    res.status(200).json({ success: true, count: payments.length, data: payments || [] });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { tenantId, amount, paymentDate, status, lineItems, paidForMonth } = req.body;

    if (!tenantId || !amount || !paymentDate) {
      return res.status(400).json({ success: false, message: 'Tenant, amount, and payment date are required' });
    }

    const tenant = await Tenant.findById(tenantId);
    if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
      return res.status(404).json({ success: false, message: 'Tenant not found in your organization' });
    }

    const newPayment = await Payment.create({
      tenantId,
      propertyId: tenant.propertyId,
      organizationId: req.user.organizationId,
      amount: Number(amount),
      status: status || 'Paid',
      paymentDate: new Date(paymentDate),
      createdBy: req.user._id,
      paymentMethod: req.body.paymentMethod || 'cash',
      description: req.body.description || `Payment from ${tenant.name}`
    });

    // Skip invoice creation for now to avoid errors
    let invoice = null;
    try {
      const invoiceNumber = `INV-${Date.now()}`;
      invoice = await Invoice.create({
        tenantId,
        propertyId: tenant.propertyId,
        organizationId: req.user.organizationId,
        invoiceNumber,
        amount: Number(amount),
        dueDate: new Date(paymentDate),
        status: status === 'Paid' ? 'paid' : 'pending'
      });
    } catch (invoiceError) {
      console.log('Invoice creation skipped:', invoiceError.message);
    }

    // Trigger action chain
    await actionChainService.onPaymentRecorded(newPayment, req.user._id, req.user.organizationId);

    res.status(201).json({ 
      success: true, 
      data: newPayment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updatePayment = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const deletePayment = async (req: AuthRequest, res: Response) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    res.json({ success: true, message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};