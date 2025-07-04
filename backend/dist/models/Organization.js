"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const OrganizationSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    members: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    status: { type: String, enum: ['active', 'inactive', 'pending_deletion'], default: 'active' },
    subscription: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Subscription' },
    branding: {
        companyName: { type: String, default: '' },
        companyLogoUrl: { type: String, default: '' },
        companyAddress: { type: String, default: '' },
    },
    dataManagement: {
        dataExportRequestedAt: Date,
        accountDeletionRequestedAt: Date,
    },
    allowSelfDeletion: { type: Boolean, default: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Organization', OrganizationSchema);
