"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
class AuditService {
    // The 'details' parameter now accepts a more complex object, not just a map of strings.
    async recordAction(userId, organizationId, action, details = {}) {
        try {
            await AuditLog_1.default.create({
                user: userId,
                organizationId,
                action,
                // Mongoose can store a flexible object in a Map type field
                details: details
            });
        }
        catch (error) {
            console.error('Failed to record audit log:', error);
        }
    }
}
exports.default = new AuditService();
//# sourceMappingURL=auditService.js.map