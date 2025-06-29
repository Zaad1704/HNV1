"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const PaymentSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    recordedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Paid' },
    transactionId: { type: String },
    // NEW SCHEMA FIELDS
    lineItems: [{
            description: { type: String, required: true },
            amount: { type: Number, required: true },
        }],
    paidForMonth: { type: Date }, // Store as Date, frontend can send 'YYYY-MM-DD'
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Payment', PaymentSchema);
//# sourceMappingURL=Payment.js.map