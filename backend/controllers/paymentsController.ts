import { Request, Response } from 'express';
import Payment from '../models/Payment';
import Tenant from '../models/Tenant';
import mongoose from 'mongoose';

export const getPayments = async (req: Request, res: Response) => {
    try {
        if (!req.user || !req.user.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        }
        
        const payments = await Payment.find({ organizationId: req.user.organizationId })
            .populate('tenantId', 'name')
            .populate('propertyId', 'name')
            .populate('recordedBy', 'name')
            .sort({ paymentDate: -1 });
            
        res.status(200).json({ success: true, count: payments.length, data: payments || [] });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(200).json({ success: true, count: 0, data: [] });
    }
};

export const createPayment = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }

    const { tenantId, amount, paymentDate, status, lineItems, paidForMonth } = req.body;

    if (!tenantId || !amount || !paymentDate) {
        res.status(400).json({ success: false, message: 'Tenant, amount, and payment date are required.' });
        return;
    }

    try {
        const tenant = await Tenant.findById(tenantId);
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Tenant not found in your organization.' });
            return;
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
            paidForMonth: paidForMonth ? new Date(paidForMonth) : undefined,
        });

        res.status(201).json({ success: true, data: newPayment });

    } catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
