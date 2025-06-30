"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const twoFactorAuth_1 = require("../middleware/twoFactorAuth");
const router = (0, express_1.Router)();
router.post('/2fa/generate', authMiddleware_1.protect, (0, express_async_handler_1.default)(twoFactorAuth_1.generateTwoFactorSecret));
router.post('/2fa/enable', authMiddleware_1.protect, (0, express_async_handler_1.default)(twoFactorAuth_1.enableTwoFactor));
router.post('/2fa/verify', authMiddleware_1.protect, (0, express_async_handler_1.default)(twoFactorAuth_1.verifyTwoFactor));
exports.default = router;
