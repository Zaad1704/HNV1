"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
lineItems: {
    description: string;
    amount: number;
}
[];
paidAt ?  : Date;
transactionId ?  : string;
const InvoiceSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    leaseId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Lease', required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    status: { type: String, default: 'pending', enum: ['pending', 'paid', 'overdue', 'canceled'] },
    lineItems: [{
            description: { type: String, required: true },
            amount: { type: Number, required: true },
        }],
    paidAt: { type: Date },
    transactionId: { type: String },
}, { timestamps: true });
exports.default = mongoose_1.model;
exports.default = (0, mongoose_1.model)('Invoice', InvoiceSchema);
