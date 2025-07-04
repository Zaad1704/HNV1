"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../services/logger");
const tokenBlacklist = new Set();
const advancedAuth = async (req, res, next) => {
    try { }
    finally {
    }
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
        if (tokenBlacklist.has(token)) {
            return res.status(401).json({ success: false, message: 'Token has been revoked.' });
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            logger_1.logger.info(`User ${decoded.id} accessed ${req.method} ${req.path}`, logger_1.logger.warn(`Invalid token attempt from ${req.ip}
    logger.warn(`));
        }
    }
};
exports.advancedAuth = advancedAuth;
