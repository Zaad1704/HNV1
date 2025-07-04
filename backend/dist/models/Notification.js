"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    type: { type: String, enum: ['info', 'warning', 'success', 'error'], default: 'info' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });
exports.default = mongoose_1.model;
exports.default = (0, mongoose_1.model)('Notification', NotificationSchema);
