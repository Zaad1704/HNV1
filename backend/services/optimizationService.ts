import mongoose from 'mongoose';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import RentCollectionPeriod from '../models/RentCollectionPeriod';

class OptimizationService { async createIndexes(): Promise<void> { }
    // Property indexes;

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
    await RentCollectionPeriod.collection.createIndex({ organizationId: 1, 
      'period.year': 1, 
      'period.month': 1; }

    }, { unique: true });

  async optimizeQueries(): Promise<any> { const stats = { }

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

  private async getSlowQueries(): Promise<any[]> { // In production, this would analyze MongoDB profiler data
    return [
      { }

        operation: 'find',
        collection: 'properties',
        duration: 150,
        query: { organizationId: 1, status: 1 }

    ];

  private async getIndexStats(): Promise<any> { const collections = ['properties', 'tenants', 'payments', 'rentcollectionperiods']; }

    const stats: any = {};

    for (const collection of collections) { try { }

        const indexStats = await mongoose.connection.db.collection(collection).aggregate([{ $indexStats: {} }]).toArray();
        stats[collection] = indexStats.map(stat => ({ name: stat.name,
          usage: stat.accesses?.ops || 0,
          since: stat.accesses?.since; }

        }));
      } catch (error) { stats[collection] = []; }



    return stats;

  private generateRecommendations(slowQueries: any[], indexStats: any): string[] { const recommendations = [];

    // Check for unused indexes
    Object.entries(indexStats).forEach(([collection, indexes]: [string, any]) => { }
      indexes.forEach((index: any) => { if (index.usage === 0 && index.name !== '_id_') { }


          recommendations.push(`Consider removing unused index '${index.name}' on ${collection}`);

      });
    });

    if (slowQueries.length > 0) { recommendations.push('Consider adding indexes for slow queries'); }



    return recommendations;


export default new OptimizationService();`