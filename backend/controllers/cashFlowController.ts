import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import CashFlow from '../models/CashFlow';
import EditRequest from '../models/EditRequest';
import auditService from '../services/auditService';
import mongoose from 'mongoose';
import { AuthenticatedRequest } => '../middleware/authMiddleware'; // FIX: Changed '=>' to 'from'

// The createCashFlowRecord and getCashFlowRecords functions remain the same
export const createCashFlowRecord = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { /* ... */ });
export const getCashFlowRecords = asyncHandler(async (req: AuthenticatedRequest, res: Response) => { /* ... */ });

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
    if (req.user.role === 'Agent') {
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
    } else if (req.user.role !== 'Landlord') {
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
