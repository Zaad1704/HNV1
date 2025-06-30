"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
class AuditService {
    async recordAction(userId, organizationId, action, details = {}) {
        try {
            await AuditLog_1.default.create({
                user: userId,
                organizationId,
                action,
                details: details
            });
        }
        catch (error) {
            console.error('Failed to record audit log:', error);
        }
    }
}
exports.default = new AuditService();
