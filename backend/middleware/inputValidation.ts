import { Request, Response, NextFunction } from 'express';
import { body, validationResult, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';

// Enhanced validation middleware
export const validateInput = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });

  next();
};

// User validation rules
export const userValidation = {
  register: [
    body('name').trim().isLength({ min: 2, max: 50 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
    body('role').isIn(['Landlord', 'Agent', 'Tenant'])
  ],
  login: [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ]
};

// Property validation rules
export const propertyValidation = {
  create: [
    body('name').trim().isLength({ min: 2, max: 100 }).escape(),
    body('address.street').trim().isLength({ min: 5, max: 200 }).escape(),
    body('address.city').trim().isLength({ min: 2, max: 50 }).escape(),
    body('address.state').trim().isLength({ min: 2, max: 50 }).escape(),
    body('address.zipCode').trim().isLength({ min: 3, max: 10 }).escape(),
    body('numberOfUnits').isInt({ min: 1, max: 1000 })
  ]
};

// Tenant validation rules
export const tenantValidation = {
  create: [
    body('name').trim().isLength({ min: 2, max: 50 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone('any'),
    body('rentAmount').isFloat({ min: 0 }),
    body('securityDeposit').optional().isFloat({ min: 0 })
  ]
};

// API rate limiting
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many API requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts',
  skipSuccessfulRequests: true,
});

// File upload validation
export const fileValidation = {
  image: (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) return next();
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.'
      });

    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });

    next();

};

// Sanitize HTML input
export const sanitizeHtml = (req: Request, res: Response, next: NextFunction) => {
  const DOMPurify = require('isomorphic-dompurify');
  
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj);

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);

      return sanitized;

    return obj;
  };
  
  req.body = sanitizeObject(req.body);
  next();
};