"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
class AuditService {
}
details: object = {};
{
    try { }
    finally {
    }
    await AuditLog_1.default.create({ user: userId,
        organizationId,
        action,
        details: details });
}
;
try { }
catch (error) {
    console.error('Failed to record audit log:', error);
    export default new AuditService();
}
