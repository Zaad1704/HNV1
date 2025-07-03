import mongoose from 'mongoose';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import RentCollectionPeriod from '../models/RentCollectionPeriod';

class OptimizationService {
  async createIndexes(): Promise<void> {
    // Property indexes
    await Property.collection.createIndex({ organizationId: 1, status: 1 });
    await Property.collection.createIndex({ organizationId: 1, 'address.city': 1 });
    await Property.collection.createIndex({ organizationId: 1, numberOfUnits: 1 });
    await Property.collection.createIndex({ organizationId: 1, createdAt: -1 });

    // Tenant indexes
    await Tenant.collection.createIndex({ organizationId: 1, status: 1 });
    await Tenant.collection.createIndex({ organizationId: 1, propertyId: 1 });
    await Tenant.collection.createIndex({ organizationId: 1, leaseEndDate: 1 });
    await Tenant.collection.createIndex({ organizationId: 1, name: 'text', email: 'text' });

    // Payment indexes
    await Payment.collection.createIndex({ organizationId: 1, status: 1 });
    await Payment.collection.createIndex({ organizationId: 1, tenantId: 1, paymentDate: -1 });
    await Payment.collection.createIndex({ organizationId: 1, propertyId: 1 });
    await Payment.collection.createIndex({ organizationId: 1, paymentDate: -1 });

    // Collection period indexes
    await RentCollectionPeriod.collection.createIndex({ 
      organizationId: 1, 
      'period.year': 1, 
      'period.month': 1 
    }, { unique: true });

  }

  async optimizeQueries(): Promise<any> {
    const stats = {
      slowQueries: [],
      indexUsage: {},
      recommendations: []
    };

    // Check for slow queries (mock implementation)
    const slowQueries = await this.getSlowQueries();
    stats.slowQueries = slowQueries;

    // Check index usage
    const indexStats = await this.getIndexStats();
    stats.indexUsage = indexStats;

    // Generate recommendations
    stats.recommendations = this.generateRecommendations(slowQueries, indexStats);

    return stats;
  }

  private async getSlowQueries(): Promise<any[]> {
    // In production, this would analyze MongoDB profiler data
    return [
      {
        operation: 'find',
        collection: 'properties',
        duration: 150,
        query: { organizationId: 1, status: 1 }
      }
    ];
  }

  private async getIndexStats(): Promise<any> {
    const collections = ['properties', 'tenants', 'payments', 'rentcollectionperiods'];
    const stats: any = {};

    for (const collection of collections) {
      try {
        const indexStats = await mongoose.connection.db.collection(collection).aggregate([{ $indexStats: {} }]).toArray();
        stats[collection] = indexStats.map(stat => ({
          name: stat.name,
          usage: stat.accesses?.ops || 0,
          since: stat.accesses?.since
        }));
      } catch (error) {
        stats[collection] = [];
      }
    }

    return stats;
  }

  private generateRecommendations(slowQueries: any[], indexStats: any): string[] {
    const recommendations = [];

    // Check for unused indexes
    Object.entries(indexStats).forEach(([collection, indexes]: [string, any]) => {
      indexes.forEach((index: any) => {
        if (index.usage === 0 && index.name !== '_id_') {
          recommendations.push(`Consider removing unused index '${index.name}' on ${collection}`);
        }
      });
    });

    // Check for missing indexes based on slow queries
    slowQueries.forEach(query => {
      if (query.duration > 100) {
        recommendations.push(`Consider adding index for slow query on ${query.collection}`);
      }
    });

    return recommendations;
  }

  async cacheWarmup(organizationId: string): Promise<void> {
    // Pre-load frequently accessed data
    await Promise.all([
      Property.find({ organizationId }).select('_id name status').lean(),
      Tenant.find({ organizationId, status: 'Active' }).select('_id name propertyId').lean(),
      Payment.find({ 
        organizationId, 
        paymentDate: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }).select('_id amount status').lean()
    ]);

  }

  async cleanupOldData(): Promise<any> {
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 2); // 2 years ago

    const results = {
      deletedExports: 0,
      deletedLogs: 0,
      archivedPayments: 0
    };

    // Clean up old export requests
    const deletedExports = await mongoose.connection.db.collection('exportrequests').deleteMany({
      createdAt: { $lt: cutoffDate },
      status: 'completed'
    });
    results.deletedExports = deletedExports.deletedCount || 0;

    // Archive old payments (move to archive collection instead of delete)
    const oldPayments = await Payment.find({
      paymentDate: { $lt: cutoffDate },
      status: 'completed'
    }).lean();

    if (oldPayments.length > 0) {
      await mongoose.connection.db.collection('payments_archive').insertMany(oldPayments);
      await Payment.deleteMany({
        _id: { $in: oldPayments.map(p => p._id) }
      });
      results.archivedPayments = oldPayments.length;
    }

    return results;
  }

  async getPerformanceMetrics(): Promise<any> {
    const metrics = {
      database: {
        connections: mongoose.connection.readyState,
        collections: {}
      },
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };

    // Get collection stats
    const collections = ['properties', 'tenants', 'payments'];
    for (const collection of collections) {
      try {
        const stats = await mongoose.connection.db.collection(collection).stats();
        metrics.database.collections[collection] = {
          count: stats.count,
          size: stats.size,
          avgObjSize: stats.avgObjSize,
          indexSizes: stats.indexSizes
        };
      } catch (error) {
        metrics.database.collections[collection] = { error: 'Unable to fetch stats' };
      }
    }

    return metrics;
  }

  async optimizeImages(): Promise<any> {
    // Find properties with large images
    const properties = await Property.find({
      imageUrl: { $exists: true, $ne: '' }
    }).select('_id name imageUrl').lean();

    const optimizationResults = {
      processed: 0,
      errors: 0,
      spaceSaved: 0
    };

    // In production, this would integrate with image optimization service
    for (const property of properties) {
      try {
        // Mock optimization
        optimizationResults.processed++;
        optimizationResults.spaceSaved += Math.random() * 1000000; // Mock bytes saved
      } catch (error) {
        optimizationResults.errors++;
      }
    }

    return optimizationResults;
  }
}

export default new OptimizationService();