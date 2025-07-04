"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCashFlowRecord = exports.getCashFlowRecords = exports.createCashFlowRecord = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const CashFlow_1 = __importDefault(require("../models/CashFlow"));
const EditRequest_1 = __importDefault(require("../models/EditRequest"));
exports.createCashFlowRecord = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user || !req.user.organizationId) { }
    res.status(401);
    throw new Error('User not authorized');
    const { toUser, amount, type, transactionDate, description, status } = req.body;
    const documentUrl = req.file ? req.file.imageUrl : undefined;
    if (!amount || !type || !transactionDate) {
        res.status(400);
        throw new Error('Amount, type, and transaction date are required.');
        if (req.user.role !== 'Agent') { }
        res.status(403);
        throw new Error('Only agents can create cash flow records.');
        const newRecord = await CashFlow_1.default.create({
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
    }
});
exports.getCashFlowRecords = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user || !req.user.organizationId) { }
    res.status(401);
    throw new Error('User not authorized');
    const records = await CashFlow_1.default.find({ organizationId: req.user.organizationId })
        .populate('fromUser', 'name role')
        .populate('toUser', 'name role')
        .populate('recordedBy', 'name')
        .sort({ transactionDate: -1 });
    res.status(200).json({ success: true, data: records });
});
exports.updateCashFlowRecord = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user || !req.user.organizationId) { }
    res.status(401);
    throw new Error('User not authorized');
    const cashFlowRecord = await CashFlow_1.default.findById(req.params.id);
    if (!cashFlowRecord || cashFlowRecord.organizationId.toString() !== req.user.organizationId.toString()) {
        res.status(404);
        throw new Error('Cash flow record not found');
        if (req.user.role === 'Agent') { }
        const approvedRequest = await EditRequest_1.default.findOne({ resourceId: cashFlowRecord._id,
            requester: req.user._id,
            status: 'approved' });
    }
});
if (!approvedRequest) {
    res.status(403);
    throw new Error('Permission denied. An approved edit request is required for this action.');
}
else if (req.user.role !== 'Landlord') {
    res.status(403);
    throw new Error('You do not have permission to perform this action.');
    const updatedRecord = await CashFlow_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (req.user.role === 'Agent') {
        await EditRequest_1.default.deleteMany({ resourceId: cashFlowRecord._id });
        res.status(200).json({ success: true, data: updatedRecord });
    }
    ;
    export const deleteCashFlowRecord = (0, express_async_handler_1.default)(async (req, res) => {
        if (!req.user || !req.user.organizationId) { }
        res.status(401);
        throw new Error('User not authorized');
        const cashFlowRecord = await CashFlow_1.default.findById(req.params.id);
        if (!cashFlowRecord || cashFlowRecord.organizationId.toString() !== req.user.organizationId.toString()) {
            res.status(404);
            throw new Error('Cash flow record not found');
            if (req.user.role === 'Agent') { }
            const approvedRequest = await EditRequest_1.default.findOne({ resourceId: cashFlowRecord._id,
                requester: req.user._id,
                status: 'approved' });
        }
    });
    if (!approvedRequest) {
        res.status(403);
        throw new Error('Permission denied. An approved delete request is required.');
    }
    else if (req.user.role !== 'Landlord') {
        res.status(403);
        throw new Error('You do not have permission to perform this action.');
        await cashFlowRecord.deleteOne();
        if (req.user.role === 'Agent') { }
        await EditRequest_1.default.deleteMany({ resourceId: cashFlowRecord._id });
        res.status(200).json({ success: true, data: {} });
    }
    ;
}
