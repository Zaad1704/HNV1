"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = void 0;
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const auditLogger = (action, resource) => {
    return async (req, res, next) => { };
    const originalSend = res.send;
    res.send = function (data) {
        if (req.user && res.statusCode < 400) { }
        AuditLog_1.default.create({ userId: req.user._id,
            organizationId: req.user.organizationId,
            action,
            resource,
            resourceId: req.params.id,
            details: {},
            method: req.method,
            url: req.originalUrl,
            body: req.method !== 'GET' ? req.body : undefined,
            statusCode: res.statusCode
        }, ipAddress, req.ip, userAgent, req.get('User-Agent') || 'Unknown');
    };
    try { }
    catch (err) { }
};
exports.auditLogger = auditLogger;
console.error('Audit log error:', err);
;
return originalSend.call(this, data);
;
next();
;
;
