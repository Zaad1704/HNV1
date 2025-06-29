"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const cacheService_1 = require("../services/cacheService");
// Import redis check
let redis = null;
if (process.env.REDIS_URL) {
    try {
        const Redis = require('redis');
        redis = Redis.createClient({ url: process.env.REDIS_URL });
    }
    catch (error) {
        redis = null;
    }
}
const router = (0, express_1.Router)();
router.get('/health', async (req, res) => {
    const startTime = Date.now();
    try {
        // Test database connection
        const dbStatus = mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected';
        // Test cache connection
        let cacheStatus = 'disabled';
        try {
            if (redis) {
                await cacheService_1.cacheService.set('health-check', 'ok', 10);
                const cacheTest = await cacheService_1.cacheService.get('health-check');
                cacheStatus = cacheTest === 'ok' ? 'connected' : 'error';
            }
        }
        catch (error) {
            cacheStatus = 'error';
        }
        const health = {
            status: dbStatus === 'connected' ? 'OK' : 'ERROR',
            timestamp: new Date().toISOString(),
            responseTime: Date.now() - startTime,
            services: {
                database: dbStatus,
                cache: cacheStatus,
                memory: {
                    used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                    total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
                },
                uptime: Math.round(process.uptime())
            },
            version: process.env.npm_package_version || '1.0.0'
        };
        const statusCode = health.status === 'OK' ? 200 : 503;
        res.status(statusCode).json(health);
    }
    catch (error) {
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: 'Health check failed'
        });
    }
});
router.get('/ready', async (req, res) => {
    try {
        // Check if all critical services are ready
        const dbReady = mongoose_1.default.connection.readyState === 1;
        if (dbReady) {
            res.status(200).json({ status: 'READY' });
        }
        else {
            res.status(503).json({ status: 'NOT_READY' });
        }
    }
    catch (error) {
        res.status(503).json({ status: 'NOT_READY' });
    }
});
exports.default = router;
//# sourceMappingURL=healthRoutes.js.map