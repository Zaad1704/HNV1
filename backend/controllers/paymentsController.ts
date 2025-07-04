import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';

interface AuthRequest extends Request {
  user?: any;
}

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.organizationId) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const payments = await Payment.find({ organizationId: req.user.organizationId })
      .populate('tenantId', 'name email')
      .populate('propertyId', 'name address')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 });

    res.status(200).json({ success: true, count: payments.length, data: payments || [] });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(200).json({ success: true, count: 0, data: [] });
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
      amount,
      paymentDate,
      status: status || 'Paid',
      propertyId: tenant.propertyId,
      organizationId: req.user.organizationId,
      recordedBy: req.user._id,
      lineItems: lineItems || [],
      paidForMonth: paidForMonth ? new Date(paidForMonth) : undefined
    });

    res.status(201).json({ success: true, data: newPayment });
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