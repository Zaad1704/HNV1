"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLogger = exports.validateApiSignature = exports.ipSecurity = exports.sessionManager = exports.blacklistToken = exports.advancedAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../services/logger");
// Enhanced JWT middleware with blacklist support
const tokenBlacklist = new Set();
const advancedAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });

        // Check if token is blacklisted
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ success: false, message: 'Token has been revoked.' });

        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        // Log access for audit
        logger_1.logger.info(`User ${decoded.id} accessed ${req.method} ${req.path}
        logger_1.logger.warn(`Invalid token attempt from ${req.ip}
        logger_1.logger.warn(