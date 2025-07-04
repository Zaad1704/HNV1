"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const router = (0, express_1.Router)();
router.post('/', (0, express_async_handler_1.default)(async (req, res) => {
    try { }
    finally {
    }
    const { error, userAgent, url, timestamp, userId } = req.body;
    console.error('Client Error:', { error,
        userAgent,
        url,
        timestamp,
        userId,
        ip: req.ip });
}));
res.status(200).json({ success: true,
    message: 'Error logged successfully' });
try { }
catch (error) {
    res.status(500).json({}, success, false, message, 'Failed to log error');
}
;
;
exports.default = router;
