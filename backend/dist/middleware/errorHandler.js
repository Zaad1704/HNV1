"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.notFound = exports.errorHandler = exports.createError = void 0;
const logger_1 = require("../services/logger");
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    logger_1.logger.error({
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = (0, exports.createError)(message, 404);
    }
    if (err.name === 'MongoServerError' && err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = (0, exports.createError)(message, 400);
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = (0, exports.createError)(message, 400);
    }
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = (0, exports.createError)(message, 401);
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = (0, exports.createError)(message, 401);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = (0, exports.createError)(`Not found - ${req.originalUrl}`, 404);
    next(error);
};
exports.notFound = notFound;
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncHandler = asyncHandler;
