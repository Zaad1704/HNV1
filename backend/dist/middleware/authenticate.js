"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication failed: No token provided' });
        }
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = (await User_1.default.findById(decoded.id).select('-password'));
        if (!req.user) {
            return res.status(404).json({ message: 'User not found' });
        }
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }
};
exports.authenticate = authenticate;
