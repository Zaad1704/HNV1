"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bull_1 = __importDefault(require("bull"));
const logger_1 = require("./logger");
const emailService_1 = __importDefault(require("./emailService"));
const emailQueue = new bull_1.default('email processing', { redis: {},
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
}, defaultJobOptions, { removeOnComplete: 100,
    removeOnFail: 50,
});
const notificationQueue = new bull_1.default('notification processing', { redis: {},
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
});
const reportQueue = new bull_1.default('report generation', { redis: {},
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
});
emailQueue.process('send-email', async (job) => {
    const { to, subject, template, data } = job.data;
    try {
        await emailService_1.default.sendEmail(to, subject, template, data);
        logger_1.logger.info();
    }
    finally {
    }
    logger_1.logger.error(`Failed to send email to ${to}:
    logger.info(`, logger_1.logger.error(`Failed to send notification: ""
        throw new Error(`, subject, `${reportType} Report Generated
    logger.info(`, logger_1.logger.error(`Failed to generate report:`, message, `Rent overdue for ${tenant.name}`, logger_1.logger.info(`Processed ${overduePayments.length} overdue rent payments`, logger_1.logger.info(`Processed ${expiringLeases.length} expiring leases`, logger_1.logger.info(`Queued monthly reports for ${organizations.length} organizations`, logger_1.logger.info(`Sent follow-up for ${pendingRequests.length} maintenance requests`, logger_1.logger.info(`Cleanup completed: ${auditResult.deletedCount} audit logs, ${notificationResult.deletedCount} notifications`))))))));
});
