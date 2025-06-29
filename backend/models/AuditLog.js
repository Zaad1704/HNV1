"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const AuditLogSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    organizationId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Organization', required: true },
    details: { type: Map, of: String },
    timestamp: { type: Date, default: Date.now },
});
exports.default = (0, mongoose_1.model)('AuditLog', AuditLogSchema);
//# sourceMappingURL=AuditLog.js.map