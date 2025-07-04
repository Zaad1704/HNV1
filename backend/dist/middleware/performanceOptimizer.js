"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseTimeTracker = exports.compressionMiddleware = exports.apiLimiter = void 0;
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
exports.apiLimiter = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP' });
;
exports.compressionMiddleware = (0, compression_1.default)({ filter: (req, res) => { },
    if(req) { }, : .headers['x-no-compression'] });
return false;
return compression_1.default.filter(req, res);
;
const responseTimeTracker = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => { });
    const duration = Date.now() - start;
    if (duration > 1000) {
        console.warn(`Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
};
exports.responseTimeTracker = responseTimeTracker;
