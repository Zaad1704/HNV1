import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Users collection indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ organizationId: 1 });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ status: 1 });
    await db.collection('users').createIndex({ createdAt: -1 });

    // Properties collection indexes
    await db.collection('properties').createIndex({ organizationId: 1 });
    await db.collection('properties').createIndex({ ownerId: 1 });
    await db.collection('properties').createIndex({ status: 1 });
    await db.collection('properties').createIndex({ 'address.city': 1 });
    await db.collection('properties').createIndex({ createdAt: -1 });

    // Tenants collection indexes
    await db.collection('tenants').createIndex({ organizationId: 1, email: 1 });
    await db.collection('tenants').createIndex({ propertyId: 1 });
    await db.collection('tenants').createIndex({ status: 1 });
    await db.collection('tenants').createIndex({ leaseEndDate: 1 });
    await db.collection('tenants').createIndex({ rentDueDate: 1 });

    // Payments collection indexes
    await db.collection('payments').createIndex({ tenantId: 1, date: -1 });
    await db.collection('payments').createIndex({ propertyId: 1, date: -1 });
    await db.collection('payments').createIndex({ organizationId: 1, date: -1 });
    await db.collection('payments').createIndex({ status: 1 });
    await db.collection('payments').createIndex({ method: 1 });

    // Expenses collection indexes
    await db.collection('expenses').createIndex({ organizationId: 1, date: -1 });
    await db.collection('expenses').createIndex({ propertyId: 1, date: -1 });
    await db.collection('expenses').createIndex({ category: 1 });
    await db.collection('expenses').createIndex({ status: 1 });

    // Maintenance requests collection indexes
    await db.collection('maintenancerequests').createIndex({ organizationId: 1, createdAt: -1 });
    await db.collection('maintenancerequests').createIndex({ propertyId: 1, status: 1 });
    await db.collection('maintenancerequests').createIndex({ tenantId: 1 });
    await db.collection('maintenancerequests').createIndex({ priority: 1, status: 1 });

    // Audit logs collection indexes
    await db.collection('auditlogs').createIndex({ organizationId: 1, timestamp: -1 });
    await db.collection('auditlogs').createIndex({ userId: 1, timestamp: -1 });
    await db.collection('auditlogs').createIndex({ action: 1 });
    await db.collection('auditlogs').createIndex({ timestamp: -1 });

    // Organizations collection indexes
    await db.collection('organizations').createIndex({ owner: 1 });
    await db.collection('organizations').createIndex({ status: 1 });
    await db.collection('organizations').createIndex({ createdAt: -1 });

    // Subscriptions collection indexes
    await db.collection('subscriptions').createIndex({ organizationId: 1 });
    await db.collection('subscriptions').createIndex({ status: 1 });
    await db.collection('subscriptions').createIndex({ currentPeriodEndsAt: 1 });
    await db.collection('subscriptions').createIndex({ trialExpiresAt: 1 });

    // Cash flow collection indexes
    await db.collection('cashflows').createIndex({ organizationId: 1, transactionDate: -1 });
    await db.collection('cashflows').createIndex({ fromUser: 1 });
    await db.collection('cashflows').createIndex({ toUser: 1 });
    await db.collection('cashflows').createIndex({ status: 1 });

    console.log('All indexes created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  }
};

createIndexes();