"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const passwordResetController_1 = require("../controllers/passwordResetController");
const router = (0, express_1.Router)();
router.post('/forgot', (0, express_async_handler_1.default)(passwordResetController_1.forgotPassword));
router.put('/reset/:resetToken', (0, express_async_handler_1.default)(passwordResetController_1.resetPassword));
exports.default = router;
