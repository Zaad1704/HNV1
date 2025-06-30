"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CashFlowSchema = new mongoose_1.Schema({
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    fromUser: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['cash_handover', 'bank_deposit'], required: true },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    transactionDate: { type: Date, default: Date.now, required: true },
    description: { type: String },
    documentUrl: { type: String },
    recordedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('CashFlow', CashFlowSchema);
