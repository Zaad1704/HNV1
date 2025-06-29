"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const LeaseSchema = new mongoose_1.Schema({
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    tenantId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Tenant', required: true, unique: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    rentAmount: { type: Number, required: true },
    status: { type: String, enum: ['active', 'expired', 'terminated'], default: 'active' },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('Lease', LeaseSchema);
//# sourceMappingURL=Lease.js.map