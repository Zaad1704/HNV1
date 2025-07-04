"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledJobs = exports.reportQueue = exports.notificationQueue = exports.emailQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("./logger");
const emailService_1 = require("./emailService");
const realTimeService_1 = require("./realTimeService");
const User_1 = __importDefault(require("../models/User"));
const Payment_1 = __importDefault(require("../models/Payment"));
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const Lease_1 = __importDefault(require("../models/Lease"));
// Initialize job queues
const emailQueue = new bull_1.default('email processing', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,

});
exports.emailQueue = emailQueue;
const notificationQueue = new bull_1.default('notification processing', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),

});
exports.notificationQueue = notificationQueue;
const reportQueue = new bull_1.default('report generation', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),

});
exports.reportQueue = reportQueue;
// Email job processor
emailQueue.process('send-email', async (job) => {
    const { to, subject, template, data } = job.data;
    try {
        await emailService_1.emailService.sendEmail(to, subject, template, data);
        logger_1.logger.info(
        logger_1.logger.error(`Failed to send email to ${to}:
        logger_1.logger.info(
        logger_1.logger.error(`Failed to send notification:
                throw new Error(
            subject: `${reportType} Report Generated
        logger_1.logger.info(
        logger_1.logger.error(`Failed to generate report:
                    message: `Rent overdue for ${payment.tenantId.name}
            logger_1.logger.info(`Processed ${overduePayments.length} overdue rent payments
            logger_1.logger.info(`Processed ${expiringLeases.length} expiring leases
            logger_1.logger.info(`Queued monthly reports for ${organizations.length} organizations
            logger_1.logger.info(`Sent follow-up for ${pendingRequests.length} maintenance requests
            logger_1.logger.info(`Cleanup completed: ${auditResult.deletedCount} audit logs, ${notificationResult.deletedCount} notifications