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
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');
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
    const documentUrl = req.file ? (req.file as any).imageUrl : undefined; // Assuming imageUrl is set by fileUploadController

    const newRecord = await CashFlow.create({
        organizationId: req.user.organizationId,
        fromUser: req.user._id,
        toUser: type === 'cash_handover' ? toUser : undefined, // Only set if type is handover
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
    if (!req.user) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const organizationId = req.user.organizationId;
    let query: any = { organizationId };

    // Agents should only see records they created or were involved in (fromUser)
    if (req.user.role === 'Agent') {
        query.fromUser = req.user._id;
    } 
    // Landlords should only see records where they are the recipient (toUser)
    else if (req.user.role === 'Landlord') {
        query.toUser = req.user._id;
    }
    // Super Admins see all records within their org (covered by organizationId query)
    // Or if role is Super Admin, they can view all records across all orgs if query.organizationId is removed.
    // For now, let's keep it scoped to their org unless explicitly requested platform-wide.

    const records = await CashFlow.find(query)
        .populate('fromUser', 'name email role') // Agent who handled
        .populate('toUser', 'name email role') // Landlord who received
        .sort({ transactionDate: -1 });

    res.status(200).json({ success: true, count: records.length, data: records });
});

// You might add update/delete functions later if needed
