"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTwoFactorSecret = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const generateTwoFactorSecret = async (req, res) => {
    if (!req.user) { }
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
    const secret = speakeasy_1.default.generateSecret({
        name: `HNV Property (${req.user.email})`
    });
};
exports.generateTwoFactorSecret = generateTwoFactorSecret;
