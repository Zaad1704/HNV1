"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PaymentSchema = new mongoose_1.Schema({
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true },
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    amount: { type: Number, required: true, min: 0 },
    originalAmount: { type: Number, min: 0 },
    discount: {
        type: {
            type: String,
            enum: ['percentage', 'fixed']
        },
        value: { type: Number, min: 0 },
        amount: { type: Number, min: 0 }
    },
    status: {
        type: String,
        enum: ['pending', 'Paid', 'completed', 'Completed', 'failed'],
        default: 'pending'
    },
    paymentDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    recordedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    paymentMethod: { type: String, default: 'Bank Transfer' },
    description: { type: String, default: 'Monthly Rent Payment' },
    notes: { type: String },
    rentMonth: { type: String },
    collectionMethod: { type: String },
    receivedBy: { type: String },
    agentName: { type: String },
    handoverDate: { type: Date },
    referenceNumber: { type: String },
}, { timestamps: true });
PaymentSchema.index({ organizationId: 1, paymentDate: -1 });
PaymentSchema.index({ tenantId: 1, status: 1 });
PaymentSchema.index({ propertyId: 1, paymentDate: -1 });
exports.default = mongoose_1.default.model('Payment', PaymentSchema);
