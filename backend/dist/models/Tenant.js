"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TenantSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    whatsappNumber: { type: String },
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property' },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    unit: { type: String },
    status: { type: String, enum: ['Active', 'Inactive', 'Late', 'Archived'], default: 'Active' },
    leaseStartDate: { type: Date },
    leaseEndDate: { type: Date },
    leaseDuration: { type: Number, default: 12 },
    rentAmount: { type: Number, default: 0 },
    securityDeposit: { type: Number, default: 0 },
    advanceRent: { type: Number, default: 0 },
    imageUrl: { type: String },
    tenantImage: { type: String },
    govtIdNumber: { type: String },
    govtIdFront: { type: String },
    govtIdBack: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    presentAddress: { type: String },
    permanentAddress: { type: String },
    emergencyContact: {
        name: { type: String },
        phone: { type: String },
        relation: { type: String }
    },
    occupation: { type: String },
    monthlyIncome: { type: Number },
    previousAddress: { type: String },
    reasonForMoving: { type: String },
    petDetails: { type: String },
    vehicleDetails: { type: String },
    specialInstructions: { type: String },
    numberOfOccupants: { type: Number, default: 1 },
    reference: {
        name: { type: String },
        phone: { type: String },
        email: { type: String },
        address: { type: String },
        relation: { type: String },
        govtIdNumber: { type: String },
    },
    additionalAdults: [{
            name: { type: String },
            phone: { type: String },
            relation: { type: String },
            fatherName: { type: String },
            motherName: { type: String },
            permanentAddress: { type: String },
            govtIdNumber: { type: String },
            govtIdImageUrl: { type: String },
            imageUrl: { type: String },
        }],
    discountAmount: { type: Number, default: 0 },
    discountExpiresAt: { type: Date },
    documents: [{
            url: { type: String },
            filename: { type: String },
            description: { type: String },
            uploadedAt: { type: Date, default: Date.now }
        }],
    uploadedImages: [{
            url: { type: String },
            description: { type: String },
            uploadedAt: { type: Date, default: Date.now }
        }],
    lastRentIncrease: {
        date: { type: Date },
        oldAmount: { type: Number },
        newAmount: { type: Number },
        type: { type: String, enum: ['percentage', 'fixed'] },
        value: { type: Number },
        reason: { type: String }
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Tenant', TenantSchema);
