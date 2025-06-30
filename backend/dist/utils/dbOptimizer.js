"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeQueries = exports.createIndexes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const createIndexes = async () => {
    const db = mongoose_1.default.connection.db;
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ organizationId: 1 });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('properties').createIndex({ organizationId: 1 });
    await db.collection('properties').createIndex({ 'address.city': 1 });
    await db.collection('properties').createIndex({ status: 1 });
    await db.collection('tenants').createIndex({ organizationId: 1 });
    await db.collection('tenants').createIndex({ propertyId: 1 });
    await db.collection('tenants').createIndex({ email: 1 });
    await db.collection('payments').createIndex({ organizationId: 1 });
    await db.collection('payments').createIndex({ tenantId: 1 });
    await db.collection('payments').createIndex({ dueDate: 1 });
    await db.collection('payments').createIndex({ status: 1 });
    await db.collection('auditlogs').createIndex({ organizationId: 1, timestamp: -1 });
    await db.collection('auditlogs').createIndex({ userId: 1, timestamp: -1 });
    console.log('Database indexes created successfully');
};
exports.createIndexes = createIndexes;
exports.optimizeQueries = {
    paginate: (page = 1, limit = 10) => ({
        skip: (page - 1) * limit,
        limit: Math.min(limit, 100)
    }),
    userProjection: { password: 0, twoFactorSecret: 0 },
    tenantProjection: { ssn: 0, emergencyContact: 0 }
};
