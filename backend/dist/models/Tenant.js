"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TenantSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    unit: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Inactive', 'Late'], default: 'Active' },
    leaseEndDate: { type: Date },
    rentAmount: { type: Number, default: 0 },
    imageUrl: { type: String },
    govtIdNumber: { type: String },
    govtIdImageUrlFront: { type: String },
    govtIdImageUrlBack: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    permanentAddress: { type: String },
    reference: {
        name: { type: String },
        phone: { type: String },
        email: { type: String },
        idNumber: { type: String },
    },
    additionalAdults: [{
            name: { type: String },
            phone: { type: String },
            fatherName: { type: String },
            motherName: { type: String },
            permanentAddress: { type: String },
            govtIdNumber: { type: String },
            govtIdImageUrl: { type: String },
            imageUrl: { type: String },
        }],
    discountAmount: { type: Number, default: 0 },
    discountExpiresAt: { type: Date },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Tenant', TenantSchema);
