"use strict";
// backend/models/Reminder.ts
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ReminderSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    type: {
        type: String,
        enum: ['email_rent_reminder', 'app_rent_reminder', 'sms_rent_reminder'],
        required: true
    },
    message: { type: String },
    nextRunDate: { type: Date, required: true },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'sent', 'failed'],
        default: 'active'
    },
    lastSentDate: { type: Date },
    sentCount: { type: Number, default: 0 },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Reminder', ReminderSchema);
//# sourceMappingURL=Reminder.js.map