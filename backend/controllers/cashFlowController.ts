import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import CashFlow from '../models/CashFlow';
import EditRequest from '../models/EditRequest';
import auditService from '../services/auditService';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; 

export const createCashFlowRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const { toUser, amount, type, transactionDate, description, status } = req.body;
    const documentUrl = req.file ? (req.file as any).imageUrl : undefined; // Get URL from uploaded file

    // Basic validation
    if (!amount || !type || !transactionDate) {
        res.status(400);
        throw new Error('Amount, type, and transaction date are required.');
    }

    // Ensure only Agents can create cash flow records directly
    if (req.user.role !== 'Agent') { // Fix TS2367: Use correct casing for role
        res.status(403);
        throw new Error('Only agents can create cash flow records.');
    }

    const newRecord = await CashFlow.create({
        organizationId: req.user.organizationId,
        fromUser: req.user._id, // The user creating the record is the 'fromUser' (Agent)
        toUser: type === 'cash_handover' ? toUser : undefined, // Only set toUser if it's a handover
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

export const getCashFlowRecords = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { 
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

/**
 * @desc    Update a cash flow record (with new permission logic)
 * @route   PUT /api/cashflow/:id
 * @access  Private
 */
export const updateCashFlowRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const cashFlowRecord = await CashFlow.findById(req.params.id);
    if (!cashFlowRecord || cashFlowRecord.organizationId.toString() !== req.user.organizationId.toString()) {
        res.status(404);
        throw new Error('Cash flow record not found');
    }

    // --- NEW PERMISSION LOGIC ---
    if (req.user.role === 'Agent') { // Fix TS2367
        // Agents cannot update directly. They need an approved request.
        const approvedRequest = await EditRequest.findOne({
            resourceId: cashFlowRecord._id,
            requester: req.user._id,
            status: 'approved'
        });

        if (!approvedRequest) {
            res.status(403);
            throw new Error('Permission denied. An approved edit request is required for this action.');
        }
    } else if (req.user.role !== 'Landlord') { // Fix TS2367
        // Block any other roles that aren't Landlord or Agent
        res.status(403);
        throw new Error('You do not have permission to perform this action.');
    }
    // If the user is a Landlord, they can proceed without a request.

    const updatedRecord = await CashFlow.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // After a successful update by an Agent, we can remove the EditRequest
    if (req.user.role === 'Agent') {
        await EditRequest.deleteMany({ resourceId: cashFlowRecord._id });
    }

    res.status(200).json({ success: true, data: updatedRecord });
});


/**
 * @desc    Delete a cash flow record (with new permission logic)
 * @route   DELETE /api/cashflow/:id
 * @access  Private
 */
export const deleteCashFlowRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('User not authorized');
    }

    const cashFlowRecord = await CashFlow.findById(req.params.id);
    if (!cashFlowRecord || cashFlowRecord.organizationId.toString() !== req.user.organizationId.toString()) {
        res.status(404);
        throw new Error('Cash flow record not found');
    }

    // --- NEW PERMISSION LOGIC ---
    if (req.user.role === 'Agent') { // Fix TS2367
        const approvedRequest = await EditRequest.findOne({
            resourceId: cashFlowRecord._id,
            requester: req.user._id,
            status: 'approved'
        });
        if (!approvedRequest) {
            res.status(403);
            throw new Error('Permission denied. An approved delete request is required.');
        }
    } else if (req.user.role !== 'Landlord') { // Fix TS2367
        res.status(403);
        throw new Error('You do not have permission to perform this action.');
    }

    await cashFlowRecord.deleteOne();

    if (req.user.role === 'Agent') {
        await EditRequest.deleteMany({ resourceId: cashFlowRecord._id });
    }

    res.status(200).json({ success: true, data: {} });
});
