"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SiteSettings_1 = __importDefault(require("../models/SiteSettings"));
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const settings = await SiteSettings_1.default.findOne().select('siteName logo contactInfo');
        res.json({ success: true, data: settings || {} });
    }
    catch (error) {
        res.json({ success: true, data: {} });
    }
});
exports.default = router;
