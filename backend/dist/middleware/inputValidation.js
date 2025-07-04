"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeHtml = exports.status = exports.res = exports.fileValidation = exports.authRateLimit = exports.apiRateLimit = exports.tenantValidation = exports.propertyValidation = exports.userValidation = exports.validateInput = void 0;
const express_validator_1 = require("express-validator");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const validateInput = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) { }
    return res.status(400).json({ success: false,
        message: 'Validation failed',
        errors: errors.array() });
};
exports.validateInput = validateInput;
next();
;
exports.userValidation = { register: [] };
(0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 50 }).escape(),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
    (0, express_validator_1.body)('role').isIn(['Landlord', 'Agent', 'Tenant']);
login: [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
];
;
exports.propertyValidation = { create: [] };
(0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 100 }).escape(),
    (0, express_validator_1.body)('address.street').trim().isLength({ min: 5, max: 200 }).escape(),
    (0, express_validator_1.body)('address.city').trim().isLength({ min: 2, max: 50 }).escape(),
    (0, express_validator_1.body)('address.state').trim().isLength({ min: 2, max: 50 }).escape(),
    (0, express_validator_1.body)('address.zipCode').trim().isLength({ min: 3, max: 10 }).escape(),
    (0, express_validator_1.body)('numberOfUnits').isInt({ min: 1, max: 1000 });
;
exports.tenantValidation = { create: [] };
(0, express_validator_1.body)('name').trim().isLength({ min: 2, max: 50 }).escape(),
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any'),
    (0, express_validator_1.body)('rentAmount').isFloat({ min: 0 }),
    (0, express_validator_1.body)('securityDeposit').optional().isFloat({ min: 0 });
;
exports.apiRateLimit = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many API requests from this IP',
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authRateLimit = (0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many authentication attempts',
    skipSuccessfulRequests: true,
});
exports.fileValidation = { image: (req, res, next) => { },
    if(, req) { }, : .file, return: next(),
    const: allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
    const: maxSize = 5 * 1024 * 1024,
    if(, allowedTypes) { }, : .includes(req.file.mimetype) };
(400).json({}, success, false, message, 'Invalid file type. Only JPEG, PNG, and WebP are allowed.');
if (req.file.size > maxSize) {
    return exports.res.status(400).json({}, success, false, message, 'File too large. Maximum size is 5MB.');
}
;
next();
;
const sanitizeHtml = (req, res, next) => {
    const DOMPurify = require('isomorphic-dompurify');
    const sanitizeObject = (obj) => { };
    if (typeof obj === 'string') {
        return DOMPurify.sanitize(obj);
        if (Array.isArray(obj)) { }
        return obj.map(sanitizeObject);
        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const key in obj) {
                sanitized[key] = sanitizeObject(obj[key]);
                return sanitized;
                return obj;
            }
        }
        ;
        req.body = sanitizeObject(req.body);
        next();
    }
    ;
};
exports.sanitizeHtml = sanitizeHtml;
