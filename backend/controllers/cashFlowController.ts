import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import CashFlow from '../models/CashFlow';
import EditRequest from '../models/EditRequest';
import auditService from '../services/auditService';
import mongoose, { Types } from 'mongoose';

export const createCashFlowRecord = asyncHandler(async (req: Request, res: Response) => { 
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const { toUser, amount, type, transactionDate, description, status } = req.body;
    const documentUrl = req.file ? (req.file as any).imageUrl : undefined;

    if (!amount || !type || !transactionDate) {
        res.status(400);
        throw new Error('Amount, type, and transaction date are required.');
    }

    if (req.user.role !== 'Agent') { 
        res.status(403);
        throw new Error('Only agents can create cash flow records.');
    }

    const newRecord = await CashFlow.create({
        organizationId: req.user.organizationId,
        fromUser: req.user._id,
        toUser: type === 'cash_handover' ? toUser : undefined,
        amount: Number(amount),
        type,
        status,
        transactionDate,
        description,
        documentUrl,
        recordedBy: req.user._id,
    });

    res.status(201).json({ success: true, data: newRecord });
});

export const getCashFlowRecords = asyncHandler(async (req: Request, res: Response) => { 
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const records = await CashFlow.find({ organizationId: req.user.organizationId })
        .populate('fromUser', 'name role')
        .populate('toUser', 'name role')
        .populate('recordedBy', 'name')
        .sort({ transactionDate: -1 });

    res.status(200).json({ success: true, data: records });
});

export const updateCashFlowRecord = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const cashFlowRecord = await CashFlow.findById(req.params.id);
    if (!cashFlowRecord || cashFlowRecord.organizationId.toString() !== req.user.organizationId.toString()) {
        res.status(404);
        throw new Error('Cash flow record not found');
    }

    if (req.user.role === 'Agent') { 
        const approvedRequest = await EditRequest.findOne({
            resourceId: cashFlowRecord._id,
            requester: req.user._id,
            status: 'approved'
        });

        if (!approvedRequest) {
            res.status(403);
            throw new Error('Permission denied. An approved edit request is required for this action.');
        }
    } else if (req.user.role !== 'Landlord') { 
        res.status(403);
        throw new Error('You do not have permission to perform this action.');
    }

    const updatedRecord = await CashFlow.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (req.user.role === 'Agent') {
        await EditRequest.deleteMany({ resourceId: cashFlowRecord._id });
    }

    res.status(200).json({ success: true, data: updatedRecord });
});

export const deleteCashFlowRecord = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const cashFlowRecord = await CashFlow.findById(req.params.id);
    if (!cashFlowRecord || cashFlowRecord.organizationId.toString() !== req.user.organizationId.toString()) {
        res.status(404);
        throw new Error('Cash flow record not found');
    }

    if (req.user.role === 'Agent') { 
        const approvedRequest = await EditRequest.findOne({
            resourceId: cashFlowRecord._id,
            requester: req.user._id,
            status: 'approved'
        });
        if (!approvedRequest) {
            res.status(403);
            throw new Error('Permission denied. An approved delete request is required.');
        }
    } else if (req.user.role !== 'Landlord') { 
        res.status(403);
        throw new Error('You do not have permission to perform this action.');
    }

    await cashFlowRecord.deleteOne();

    if (req.user.role === 'Agent') {
        await EditRequest.deleteMany({ resourceId: cashFlowRecord._id });
    }

    res.status(200).json({ success: true, data: {} });
});
