// backend/controllers/cashFlowController.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import CashFlow from '../models/CashFlow';
import auditService from '../services/auditService';
import mongoose from 'mongoose';

// @desc    Create a new cash flow record (cash handover or bank deposit)
// @route   POST /api/cashflow
// @access  Private (Agent)
export const createCashFlowRecord = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized or not part of an organization');
    }
    // Only Agents should be able to create these records
    if (req.user.role !== 'Agent') {
        res.status(403);
        throw new Error('Only Agents can record cash flow transactions.');
    }

    const { toUser, amount, type, transactionDate, description, status } = req.body;

    if (!amount || !type || !transactionDate) {
        res.status(400);
        throw new Error('Amount, type, and transaction date are required.');
    }
    if (type === 'cash_handover' && !toUser) {
        res.status(400);
        throw new Error('Recipient (toUser) is required for cash handover.');
    }

    // documentUrl comes from Multer's req.file processing
    const documentUrl = req.file ? (req.file as any).imageUrl : undefined;

    const newRecord = await CashFlow.create({
        organizationId: req.user.organizationId,
        fromUser: req.user._id,
        toUser: type === 'cash_handover' ? toUser : undefined,
        amount: Number(amount),
        type,
        status: status || 'pending',
        transactionDate: new Date(transactionDate),
        description,
        documentUrl,
        recordedBy: req.user._id,
    });

    auditService.recordAction(
        req.user._id,
        req.user.organizationId,
        'CASHFLOW_RECORD_CREATE',
        {
            recordId: newRecord._id.toString(),
            type: newRecord.type,
            amount: newRecord.amount,
            from: (req.user as any).name,
            to: newRecord.toUser ? newRecord.toUser.toString() : 'Bank/System'
        }
    );

    res.status(201).json({ success: true, data: newRecord });
});

// @desc    Get cash flow records for the user's organization
// @route   GET /api/cashflow
// @access  Private (Agent, Landlord, Super Admin)
export const getCashFlowRecords = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized or not part of an organization');
    }

    const organizationId = req.user.organizationId;
    let query: any = { organizationId };

    if (req.user.role === 'Agent') {
        query.fromUser = req.user._id;
    } 
    else if (req.user.role === 'Landlord') {
        query.toUser = req.user._id;
    }
    
    const records = await CashFlow.find(query)
        .populate('fromUser', 'name email role')
        .populate('toUser', 'name email role')
        .sort({ transactionDate: -1 });

    res.status(200).json({ success: true, count: records.length, data: records });
});
