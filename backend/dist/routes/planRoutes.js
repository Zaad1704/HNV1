"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Plan_1 = __importDefault(require("../models/Plan"));
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const plans = await Plan_1.default.find({ isActive: true }).select('name price features');
        res.json({ success: true, data: plans });
    }
    catch (error) {
        res.json({ success: true, data: [] });
    }
});
exports.default = router;
