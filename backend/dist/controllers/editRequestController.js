"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectEditRequest = exports.approveEditRequest = exports.getEditRequests = exports.createEditRequest = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const EditRequest_1 = __importDefault(require("../models/EditRequest"));
const CashFlow_1 = __importDefault(require("../models/CashFlow"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
const mongoose_1 = require("mongoose");
exports.createEditRequest = (0, express_async_handler_1.default)(async (req, res) => {
    const { resourceId, resourceModel, reason, approverId } = req.body;
    const requester = req.user;
    if (!resourceId || !resourceModel || !reason || !approverId) {
        res.status(400);
        throw new Error('Resource details, reason, and approver are required.');
    }
    if (resourceModel === 'CashFlow') {
        const resource = await CashFlow_1.default.findById(resourceId);
        if (!resource || resource.organizationId.toString() !== requester.organizationId?.toString()) {
            res.status(404);
            throw new Error('Resource not found in your organization.');
        }
    }
    const newRequest = await EditRequest_1.default.create({
        resourceId: new mongoose_1.Types.ObjectId(resourceId),
        resourceModel,
        reason,
        requester: requester._id,
        approver: new mongoose_1.Types.ObjectId(approverId),
        organizationId: requester.organizationId,
        status: 'pending',
    });
    const message = `${requester.name} has requested permission to edit a ${resourceModel} record.`;
    await notificationService_1.default.createNotification(new mongoose_1.Types.ObjectId(approverId), requester.organizationId, message, '/dashboard/approvals');
    res.status(201).json({ success: true, data: newRequest });
});
exports.getEditRequests = (0, express_async_handler_1.default)(async (req, res) => {
    const approverId = req.user._id;
    const requests = await EditRequest_1.default.find({ approver: approverId, status: 'pending' })
        .populate('requester', 'name email')
        .populate({
        path: 'resourceId',
        model: 'CashFlow'
    });
    res.status(200).json({ success: true, data: requests });
});
exports.approveEditRequest = (0, express_async_handler_1.default)(async (req, res) => {
    const request = await EditRequest_1.default.findById(req.params.id);
    if (!request || request.approver.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Request not found or you are not authorized to approve it.');
    }
    request.status = 'approved';
    await request.save();
    const message = `Your request to edit a ${request.resourceModel} record has been approved.`;
    await notificationService_1.default.createNotification(request.requester, request.organizationId, message, '/dashboard/cashflow');
    res.status(200).json({ success: true, data: request });
});
exports.rejectEditRequest = (0, express_async_handler_1.default)(async (req, res) => {
    const request = await EditRequest_1.default.findById(req.params.id);
    if (!request || request.approver.toString() !== req.user._id.toString()) {
        res.status(404);
        throw new Error('Request not found or you are not authorized to reject it.');
    }
    await request.deleteOne();
    const message = `Your request to edit a ${request.resourceModel} record has been rejected.`;
    await notificationService_1.default.createNotification(request.requester, request.organizationId, message, '/dashboard/cashflow');
    res.status(200).json({ success: true, message: 'Request rejected successfully.' });
});
