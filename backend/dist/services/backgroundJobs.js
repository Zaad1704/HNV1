"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledJobs = exports.reportQueue = exports.notificationQueue = exports.emailQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const cron = __importStar(require("node-cron"));
const logger_1 = require("./logger");
const emailService_1 = __importDefault(require("./emailService"));
const realTimeService_1 = require("./realTimeService");
const User_1 = __importDefault(require("../models/User"));
const Payment_1 = __importDefault(require("../models/Payment"));
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const Lease_1 = __importDefault(require("../models/Lease"));
const emailQueue = new bull_1.default('email processing', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
    }
});
exports.emailQueue = emailQueue;
const notificationQueue = new bull_1.default('notification processing', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    }
});
exports.notificationQueue = notificationQueue;
const reportQueue = new bull_1.default('report generation', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    }
});
exports.reportQueue = reportQueue;
emailQueue.process('send-email', async (job) => {
    const { to, subject, template, data } = job.data;
    try {
        await emailService_1.default.sendEmail(to, subject, template, data);
        logger_1.logger.info(`Email sent successfully to ${to}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to send email to ${to}:`, error);
        throw error;
    }
});
notificationQueue.process('send-notification', async (job) => {
    const { userId, organizationId, type, message, data } = job.data;
    try {
        const realTimeService = (0, realTimeService_1.getRealTimeService)();
        if (userId) {
            realTimeService.sendToUser(userId, type, { message, data });
        }
        else if (organizationId) {
            realTimeService.sendToOrganization(organizationId, type, { message, data });
        }
        logger_1.logger.info(`Notification sent: ${type}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to send notification:`, error);
        throw error;
    }
});
reportQueue.process('generate-report', async (job) => {
    const { organizationId, reportType, userId, parameters } = job.data;
    try {
        let reportData;
        switch (reportType) {
            case 'financial':
                reportData = await generateFinancialReport(organizationId, parameters);
                break;
            case 'occupancy':
                reportData = await generateOccupancyReport(organizationId, parameters);
                break;
            case 'maintenance':
                reportData = await generateMaintenanceReport(organizationId, parameters);
                break;
            default:
                throw new Error(`Unknown report type: ${reportType}`);
        }
        await emailQueue.add('send-email', {
            to: await getUserEmail(userId),
            subject: `${reportType} Report Generated`,
            template: 'reportGenerated',
            data: { reportData, reportType }
        });
        logger_1.logger.info(`Report generated: ${reportType} for org ${organizationId}`);
    }
    catch (error) {
        logger_1.logger.error(`Failed to generate report:`, error);
        throw error;
    }
});
class ScheduledJobs {
    static initialize() {
        cron.schedule('0 9 * * *', async () => {
            logger_1.logger.info('Running daily rent reminder check');
            await this.checkOverdueRent();
        });
        cron.schedule('0 9 * * 1', async () => {
            logger_1.logger.info('Running weekly lease expiration check');
            await this.checkExpiringLeases();
        });
        cron.schedule('0 10 1 * *', async () => {
            logger_1.logger.info('Generating monthly financial reports');
            await this.generateMonthlyReports();
        });
        cron.schedule('0 18 * * *', async () => {
            logger_1.logger.info('Running maintenance request follow-up');
            await this.followUpMaintenanceRequests();
        });
        cron.schedule('0 2 * * 0', async () => {
            logger_1.logger.info('Running data cleanup');
            await this.cleanupOldData();
        });
    }
    static async checkOverdueRent() {
        try {
            const overduePayments = await Payment_1.default.find({
                status: 'pending',
                dueDate: { $lt: new Date() }
            }).populate('tenantId organizationId');
            for (const payment of overduePayments) {
                const tenant = payment.tenantId;
                const paymentDoc = payment;
                await emailQueue.add('send-email', {
                    to: tenant.email,
                    subject: 'Rent Payment Overdue',
                    template: 'rentOverdue',
                    data: {
                        tenantName: tenant.name,
                        amount: paymentDoc.amount,
                        dueDate: paymentDoc.dueDate,
                        daysOverdue: Math.floor((Date.now() - paymentDoc.dueDate.getTime()) / (1000 * 60 * 60 * 24))
                    }
                });
                const organization = payment.organizationId;
                await notificationQueue.add('send-notification', {
                    organizationId: organization._id,
                    type: 'rent_overdue',
                    message: `Rent overdue for ${tenant.name}`,
                    data: payment
                });
            }
            logger_1.logger.info(`Processed ${overduePayments.length} overdue rent payments`);
        }
        catch (error) {
            logger_1.logger.error('Error checking overdue rent:', error);
        }
    }
    static async checkExpiringLeases() {
        try {
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            const expiringLeases = await Lease_1.default.find({
                endDate: { $lte: thirtyDaysFromNow, $gte: new Date() },
                status: 'active'
            }).populate('tenantId organizationId propertyId');
            for (const lease of expiringLeases) {
                const leaseTenant = lease.tenantId;
                const leaseProperty = lease.propertyId;
                const leaseOrg = lease.organizationId;
                await emailQueue.add('send-email', {
                    to: await getOrganizationOwnerEmail(leaseOrg._id),
                    subject: 'Lease Expiring Soon',
                    template: 'leaseExpiring',
                    data: {
                        tenantName: leaseTenant.name,
                        propertyName: leaseProperty.name,
                        expirationDate: lease.endDate
                    }
                });
                await emailQueue.add('send-email', {
                    to: leaseTenant.email,
                    subject: 'Your Lease is Expiring Soon',
                    template: 'leaseExpiringTenant',
                    data: {
                        tenantName: leaseTenant.name,
                        propertyName: leaseProperty.name,
                        expirationDate: lease.endDate
                    }
                });
            }
            logger_1.logger.info(`Processed ${expiringLeases.length} expiring leases`);
        }
        catch (error) {
            logger_1.logger.error('Error checking expiring leases:', error);
        }
    }
    static async generateMonthlyReports() {
        try {
            const organizations = await User_1.default.distinct('organizationId', { role: { $in: ['Landlord', 'Super Admin'] } });
            for (const orgId of organizations) {
                await reportQueue.add('generate-report', {
                    organizationId: orgId,
                    reportType: 'financial',
                    userId: await getOrganizationOwnerId(orgId),
                    parameters: {
                        period: 'monthly',
                        month: new Date().getMonth(),
                        year: new Date().getFullYear()
                    }
                });
            }
            logger_1.logger.info(`Queued monthly reports for ${organizations.length} organizations`);
        }
        catch (error) {
            logger_1.logger.error('Error generating monthly reports:', error);
        }
    }
    static async followUpMaintenanceRequests() {
        try {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            const pendingRequests = await MaintenanceRequest_1.default.find({
                status: 'pending',
                createdAt: { $lte: threeDaysAgo }
            }).populate('tenantId organizationId propertyId');
            for (const request of pendingRequests) {
                const requestDoc = request;
                const requestTenant = requestDoc.tenantId;
                const requestProperty = requestDoc.propertyId;
                const requestOrg = requestDoc.organizationId;
                await emailQueue.add('send-email', {
                    to: await getOrganizationOwnerEmail(requestOrg._id),
                    subject: 'Maintenance Request Follow-up',
                    template: 'maintenanceFollowUp',
                    data: {
                        requestTitle: requestDoc.title,
                        tenantName: requestTenant.name,
                        propertyName: requestProperty.name,
                        daysOld: Math.floor((Date.now() - requestDoc.createdAt.getTime()) / (1000 * 60 * 60 * 24))
                    }
                });
            }
            logger_1.logger.info(`Sent follow-up for ${pendingRequests.length} maintenance requests`);
        }
        catch (error) {
            logger_1.logger.error('Error following up maintenance requests:', error);
        }
    }
    static async cleanupOldData() {
        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const auditResult = await require('../models/AuditLog').deleteMany({
                timestamp: { $lt: sixMonthsAgo }
            });
            const notificationResult = await require('../models/Notification').deleteMany({
                createdAt: { $lt: sixMonthsAgo },
                read: true
            });
            logger_1.logger.info(`Cleanup completed: ${auditResult.deletedCount} audit logs, ${notificationResult.deletedCount} notifications`);
        }
        catch (error) {
            logger_1.logger.error('Error during data cleanup:', error);
        }
    }
}
exports.ScheduledJobs = ScheduledJobs;
async function generateFinancialReport(organizationId, parameters) {
    const payments = await Payment_1.default.find({
        organizationId,
        createdAt: {
            $gte: new Date(parameters.year, parameters.month, 1),
            $lt: new Date(parameters.year, parameters.month + 1, 1)
        }
    });
    return {
        totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
        paymentCount: payments.length,
    };
}
async function generateOccupancyReport(organizationId, parameters) {
    return {};
}
async function generateMaintenanceReport(organizationId, parameters) {
    return {};
}
async function getUserEmail(userId) {
    const user = await User_1.default.findById(userId);
    return user?.email || '';
}
async function getOrganizationOwnerEmail(organizationId) {
    const org = await require('../models/Organization').findById(organizationId).populate('owner');
    return org?.owner?.email || '';
}
async function getOrganizationOwnerId(organizationId) {
    const org = await require('../models/Organization').findById(organizationId);
    return org?.owner?.toString() || '';
}
