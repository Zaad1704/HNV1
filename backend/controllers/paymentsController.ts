import { Request, Response } from 'express'; // FIX: Import Request
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';
// FIX: AuthenticatedRequest is no longer needed.
import mongoose from 'mongoose';

// This function already exists
export const getPayments = async (req: Request, res: Response) => { // FIX: Use Request
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const payments = await Payment.find({ organizationId: req.user.organizationId })
      .populate('tenantId', 'name')
      .populate('propertyId', 'name')
      .populate('recordedBy', 'name')
      .sort({ paymentDate: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
};

// --- NEW FUNCTION ---
// @desc    Record a new manual payment
// @route   POST /api/payments
// @access  Private (Landlord, Agent)
export const createPayment = async (req: Request, res: Response) => { // FIX: Use Request
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const { tenantId, amount, paymentDate, status } = req.body;

    if (!tenantId || !amount || !paymentDate) {
        return res.status(400).json({ success: false, message: 'Tenant, amount, and payment date are required.' });
    }

    try {
        const tenant = await Tenant.findById(tenantId);
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found in your organization.' });
        }

        const newPayment = await Payment.create({
            tenantId,
            amount,
            paymentDate,
            status: status || 'Paid', // Default to 'Paid' if not provided
            propertyId: tenant.propertyId,
            organizationId: req.user.organizationId,
            recordedBy: req.user._id // FIX: Use _id
        });

        res.status(201).json({ success: true, data: newPayment });

    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
