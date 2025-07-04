"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const authController_1 = require("../controllers/authController");
const passwordResetController_1 = require("../controllers/passwordResetController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validateMiddleware_1 = require("../middleware/validateMiddleware");
const userValidator_1 = require("../validators/userValidator");
const router = (0, express_1.Router)();
router.post('/register', (0, validateMiddleware_1.validate)(userValidator_1.registerSchema), authController_1.registerUser);
router.post('/login', authController_1.loginUser);
router.get('/me', authMiddleware_1.protect, authController_1.getMe);
router.get('/verify-email/:token', authController_1.verifyEmail);
router.post('/resend-verification', authController_1.resendVerification);
router.post('/forgot-password', passwordResetController_1.forgotPassword);
router.put('/reset-password/:resetToken', passwordResetController_1.resetPassword);
router.put('/profile', authMiddleware_1.protect, authController_1.updateProfile);
router.get('/google', (req, res, next) => { const role = req.query.role || 'Landlord'; });
const state = Buffer.from(JSON.stringify({ role })).toString('base64');
const authenticator = passport_1.default.authenticate('google', {
    scope: ['profile', 'email'],
    state: state,
});
authenticator(req, res, next);
;
router.get('/google/callback', (req, res, next) => {
    const state = req.query.state;
    if (state) { }
    const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
    req.authRole = decodedState.role;
    const authenticator = passport_1.default.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=google-auth-failed`
    });
});
