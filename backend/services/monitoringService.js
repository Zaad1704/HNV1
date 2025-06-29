"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringService = void 0;
const logger_1 = require("./logger");
const os_1 = __importDefault(require("os"));
const mongoose_1 = __importDefault(require("mongoose"));
class MonitoringService {
    constructor() {
        this.metrics = [];
        this.requestCount = 0;
        this.errorCount = 0;
        this.responseTimes = [];
        // Middleware to track request metrics
        this.trackRequest = (req, res, next) => {
            const startTime = Date.now();
            this.requestCount++;
            res.on('finish', () => {
                const responseTime = Date.now() - startTime;
                this.responseTimes.push(responseTime);
                if (res.statusCode >= 400) {
                    this.errorCount++;
                }
                // Log slow requests
                if (responseTime > 5000) {
                    logger_1.logger.warn('Slow request detected', {
                        method: req.method,
                        url: req.url,
                        responseTime,
                        statusCode: res.statusCode
                    });
                }
            });
            next();
        };
        // Collect metrics every minute
        setInterval(() => {
            this.collectMetrics();
        }, 60000);
        // Clean old metrics every hour (keep last 24 hours)
        setInterval(() => {
            this.cleanOldMetrics();
        }, 3600000);
    }
    collectMetrics() {
        const cpuUsage = process.cpuUsage();
        const memUsage = process.memoryUsage();
        const totalMem = os_1.default.totalmem();
        const metrics = {
            timestamp: new Date(),
            cpuUsage: (cpuUsage.user + cpuUsage.system) / 1000000, // Convert to seconds
            memoryUsage: {
                used: memUsage.heapUsed,
                total: totalMem,
                percentage: (memUsage.heapUsed / totalMem) * 100
            },
            activeConnections: mongoose_1.default.connection.readyState,
            responseTime: this.getAverageResponseTime(),
            errorRate: this.getErrorRate()
        };
        this.metrics.push(metrics);
        // Log critical metrics
        if (metrics.memoryUsage.percentage > 80) {
            logger_1.logger.warn('High memory usage detected', { usage: metrics.memoryUsage.percentage });
        }
        if (metrics.errorRate > 5) {
            logger_1.logger.warn('High error rate detected', { errorRate: metrics.errorRate });
        }
    }
    getAverageResponseTime() {
        if (this.responseTimes.length === 0)
            return 0;
        const sum = this.responseTimes.reduce((a, b) => a + b, 0);
        return sum / this.responseTimes.length;
    }
    getErrorRate() {
        if (this.requestCount === 0)
            return 0;
        return (this.errorCount / this.requestCount) * 100;
    }
    cleanOldMetrics() {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.metrics = this.metrics.filter(metric => metric.timestamp > oneDayAgo);
        // Reset counters
        this.requestCount = 0;
        this.errorCount = 0;
        this.responseTimes = [];
    }
    // Health check endpoint data
    getHealthStatus() {
        const latestMetrics = this.metrics[this.metrics.length - 1];
        return {
            status: 'healthy',
            timestamp: new Date(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: mongoose_1.default.connection.readyState === 1 ? 'connected' : 'disconnected',
                name: mongoose_1.default.connection.name
            },
            metrics: latestMetrics ? {
                cpuUsage: latestMetrics.cpuUsage,
                memoryUsage: latestMetrics.memoryUsage,
                responseTime: latestMetrics.responseTime,
                errorRate: latestMetrics.errorRate
            } : null,
            requests: {
                total: this.requestCount,
                errors: this.errorCount
            }
        };
    }
    // Get performance metrics for dashboard
    getMetrics(hours = 1) {
        const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
        return this.metrics.filter(metric => metric.timestamp > cutoff);
    }
    // Alert system
    checkAlerts() {
        const latest = this.metrics[this.metrics.length - 1];
        if (!latest)
            return;
        const alerts = [];
        if (latest.memoryUsage.percentage > 90) {
            alerts.push({
                type: 'critical',
                message: 'Memory usage above 90%',
                value: latest.memoryUsage.percentage
            });
        }
        if (latest.errorRate > 10) {
            alerts.push({
                type: 'warning',
                message: 'Error rate above 10%',
                value: latest.errorRate
            });
        }
        if (latest.responseTime > 3000) {
            alerts.push({
                type: 'warning',
                message: 'Average response time above 3 seconds',
                value: latest.responseTime
            });
        }
        if (alerts.length > 0) {
            logger_1.logger.warn('System alerts triggered', { alerts });
        }
        return alerts;
    }
    // Database performance monitoring
    async getDatabaseStats() {
        try {
            const db = mongoose_1.default.connection.db;
            const stats = await db.stats();
            return {
                collections: stats.collections,
                dataSize: stats.dataSize,
                indexSize: stats.indexSize,
                storageSize: stats.storageSize,
                avgObjSize: stats.avgObjSize
            };
        }
        catch (error) {
            logger_1.logger.error('Failed to get database stats', error);
            return null;
        }
    }
}
exports.monitoringService = new MonitoringService();
//# sourceMappingURL=monitoringService.js.map