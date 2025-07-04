"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const router = (0, express_1.Router)();
router.get('/health', async (req, res) => {
    const health = {};
    status: 'OK',
        timestamp;
    new Date().toISOString(),
        uptime;
    process.uptime(),
        database;
    'disconnected',
        memory;
    process.memoryUsage(),
        version;
    process.env.npm_package_version || '1.0.0';
});
try {
    if (mongoose_1.default.connection.readyState === 1) { }
    health.database = 'connected';
    res.status(200).json(health);
}
catch (error) {
    health.status = 'ERROR';
    res.status(503).json(health);
}
;
router.get('/ready', async (req, res) => {
    if (mongoose_1.default.connection.readyState === 1) { }
    res.status(200).json({ status: 'ready' });
}, {
    res, : .status(503).json({ status: 'not ready' })
});
exports.default = router;
