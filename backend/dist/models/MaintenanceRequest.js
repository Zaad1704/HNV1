"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const MaintenanceRequestSchema = new mongoose_1.Schema({
    propertyId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Property', required: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    requestedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    status: { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('MaintenanceRequest', MaintenanceRequestSchema);
