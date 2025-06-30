"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDatabaseIndexes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = require("../services/logger");
dotenv_1.default.config();
const createDatabaseIndexes = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI is not defined');
        }
        await mongoose_1.default.connect(process.env.MONGO_URI);
        logger_1.logger.info('Connected to MongoDB for index creation');
        const db = mongoose_1.default.connection.db;
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ organizationId: 1 });
        await db.collection('users').createIndex({ role: 1 });
        await db.collection('users').createIndex({ status: 1 });
        await db.collection('users').createIndex({ createdAt: -1 });
        await db.collection('users').createIndex({ 'email': 1, 'organizationId': 1 });
        await db.collection('properties').createIndex({ organizationId: 1 });
        await db.collection('properties').createIndex({ createdBy: 1 });
        await db.collection('properties').createIndex({ managedByAgentId: 1 });
        await db.collection('properties').createIndex({ status: 1 });
        await db.collection('properties').createIndex({ location: '2dsphere' });
        await db.collection('properties').createIndex({ 'address.city': 1 });
        await db.collection('properties').createIndex({ 'address.state': 1 });
        await db.collection('properties').createIndex({ createdAt: -1 });
        await db.collection('tenants').createIndex({ organizationId: 1 });
        await db.collection('tenants').createIndex({ propertyId: 1 });
        await db.collection('tenants').createIndex({ email: 1 });
        await db.collection('tenants').createIndex({ status: 1 });
        await db.collection('tenants').createIndex({ leaseEndDate: 1 });
        await db.collection('tenants').createIndex({ rentDueDate: 1 });
        await db.collection('tenants').createIndex({ createdAt: -1 });
        await db.collection('payments').createIndex({ organizationId: 1 });
        await db.collection('payments').createIndex({ tenantId: 1 });
        await db.collection('payments').createIndex({ propertyId: 1 });
        await db.collection('payments').createIndex({ status: 1 });
        await db.collection('payments').createIndex({ dueDate: 1 });
        await db.collection('payments').createIndex({ paidDate: 1 });
        await db.collection('payments').createIndex({ createdAt: -1 });
        await db.collection('expenses').createIndex({ organizationId: 1 });
        await db.collection('expenses').createIndex({ propertyId: 1 });
        await db.collection('expenses').createIndex({ category: 1 });
        await db.collection('expenses').createIndex({ date: -1 });
        await db.collection('expenses').createIndex({ createdAt: -1 });
        await db.collection('maintenancerequests').createIndex({ organizationId: 1 });
        await db.collection('maintenancerequests').createIndex({ propertyId: 1 });
        await db.collection('maintenancerequests').createIndex({ tenantId: 1 });
        await db.collection('maintenancerequests').createIndex({ status: 1 });
        await db.collection('maintenancerequests').createIndex({ priority: 1 });
        await db.collection('maintenancerequests').createIndex({ createdAt: -1 });
        await db.collection('organizations').createIndex({ owner: 1 });
        await db.collection('organizations').createIndex({ status: 1 });
        await db.collection('organizations').createIndex({ members: 1 });
        await db.collection('organizations').createIndex({ createdAt: -1 });
        await db.collection('notifications').createIndex({ userId: 1 });
        await db.collection('notifications').createIndex({ organizationId: 1 });
        await db.collection('notifications').createIndex({ read: 1 });
        await db.collection('notifications').createIndex({ type: 1 });
        await db.collection('notifications').createIndex({ createdAt: -1 });
        await db.collection('auditlogs').createIndex({ userId: 1 });
        await db.collection('auditlogs').createIndex({ organizationId: 1 });
        await db.collection('auditlogs').createIndex({ action: 1 });
        await db.collection('auditlogs').createIndex({ resourceType: 1 });
        await db.collection('auditlogs').createIndex({ timestamp: -1 });
        await db.collection('invoices').createIndex({ organizationId: 1 });
        await db.collection('invoices').createIndex({ tenantId: 1 });
        await db.collection('invoices').createIndex({ propertyId: 1 });
        await db.collection('invoices').createIndex({ status: 1 });
        await db.collection('invoices').createIndex({ dueDate: 1 });
        await db.collection('invoices').createIndex({ createdAt: -1 });
        await db.collection('leases').createIndex({ organizationId: 1 });
        await db.collection('leases').createIndex({ tenantId: 1 });
        await db.collection('leases').createIndex({ propertyId: 1 });
        await db.collection('leases').createIndex({ status: 1 });
        await db.collection('leases').createIndex({ startDate: 1 });
        await db.collection('leases').createIndex({ endDate: 1 });
        await db.collection('payments').createIndex({
            organizationId: 1,
            status: 1,
            dueDate: 1
        });
        await db.collection('properties').createIndex({
            organizationId: 1,
            status: 1
        });
        await db.collection('tenants').createIndex({
            organizationId: 1,
            status: 1,
            leaseEndDate: 1
        });
        await db.collection('maintenancerequests').createIndex({
            organizationId: 1,
            status: 1,
            priority: 1
        });
        logger_1.logger.info('All database indexes created successfully');
        const collections = ['users', 'properties', 'tenants', 'payments', 'expenses', 'maintenancerequests'];
        for (const collectionName of collections) {
            const indexes = await db.collection(collectionName).indexes();
            logger_1.logger.info(`${collectionName} indexes:`, indexes.map(idx => idx.name));
        }
    }
    catch (error) {
        logger_1.logger.error('Error creating indexes:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        logger_1.logger.info('Disconnected from MongoDB');
    }
};
exports.createDatabaseIndexes = createDatabaseIndexes;
if (require.main === module) {
    createDatabaseIndexes();
}
