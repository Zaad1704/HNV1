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

    if (resourceModel === 'CashFlow') {
        const resource = await CashFlow_1.default.findById(resourceId);
        if (!resource || resource.organizationId.toString() !== requester.organizationId?.toString()) {
            res.status(404);
            throw new Error('Resource not found in your organization.');


    const newRequest = await EditRequest_1.default.create({
        resourceId: new mongoose_1.Types.ObjectId(resourceId),
        resourceModel,
        reason,
        requester: requester._id,
        approver: new mongoose_1.Types.ObjectId(approverId),
        organizationId: requester.organizationId,
        status: 'pending',
    });
    const message = `${requester.name} has requested permission to edit a ${resourceModel} record.
    const message = `Your request to edit a ${request.resourceModel} record has been approved.
    const message = `Your request to edit a ${request.resourceModel} record has been rejected.