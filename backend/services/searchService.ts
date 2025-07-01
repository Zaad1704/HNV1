import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import MaintenanceRequest from '../models/MaintenanceRequest';

interface SearchQuery {
  query: string;
  filters: Record<string, any>;
  sort: string;
  page: number;
  limit: number;
}

class SearchService {
  async globalSearch(organizationId: string, searchQuery: SearchQuery): Promise<any> {
    const { query, filters, sort, page, limit } = searchQuery;
    const skip = (page - 1) * limit;

    // Build base query
    const baseQuery: any = { organizationId };
    
    // Add text search if query provided
    const textSearch = query ? {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    } : {};

    // Search properties
    const propertyQuery = { ...baseQuery, ...textSearch };
    if (filters.propertyType) propertyQuery.type = filters.propertyType;
    if (filters.status) propertyQuery.status = filters.status;

    const properties = await Property.find(propertyQuery)
      .sort(this.buildSort(sort))
      .skip(skip)
      .limit(limit)
      .lean();

    // Search tenants
    const tenantQuery = { ...baseQuery, ...textSearch };
    if (filters.leaseStatus) tenantQuery.status = filters.leaseStatus;

    const tenants = await Tenant.find(tenantQuery)
      .populate('propertyId', 'name')
      .sort(this.buildSort(sort))
      .skip(skip)
      .limit(limit)
      .lean();

    // Search payments
    const paymentQuery = { ...baseQuery };
    if (query) {
      paymentQuery.$or = [
        { description: { $regex: query, $options: 'i' } },
        { transactionId: { $regex: query, $options: 'i' } }
      ];
    }
    if (filters.paymentStatus) paymentQuery.status = filters.paymentStatus;
    if (filters.dateRange) {
      paymentQuery.paymentDate = {
        $gte: new Date(filters.dateRange.start),
        $lte: new Date(filters.dateRange.end)
      };
    }

    const payments = await Payment.find(paymentQuery)
      .populate('tenantId', 'name')
      .populate('propertyId', 'name')
      .sort(this.buildSort(sort))
      .skip(skip)
      .limit(limit)
      .lean();

    // Search maintenance requests
    const maintenanceQuery = { ...baseQuery };
    if (query) {
      maintenanceQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    if (filters.priority) maintenanceQuery.priority = filters.priority;
    if (filters.maintenanceStatus) maintenanceQuery.status = filters.maintenanceStatus;

    const maintenance = await MaintenanceRequest.find(maintenanceQuery)
      .populate('propertyId', 'name')
      .populate('tenantId', 'name')
      .sort(this.buildSort(sort))
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      properties: { data: properties, total: await Property.countDocuments(propertyQuery) },
      tenants: { data: tenants, total: await Tenant.countDocuments(tenantQuery) },
      payments: { data: payments, total: await Payment.countDocuments(paymentQuery) },
      maintenance: { data: maintenance, total: await MaintenanceRequest.countDocuments(maintenanceQuery) }
    };
  }

  async advancedPropertySearch(organizationId: string, filters: any): Promise<any> {
    const query: any = { organizationId };

    // Location filters
    if (filters.city) query['address.city'] = { $regex: filters.city, $options: 'i' };
    if (filters.state) query['address.state'] = filters.state;
    if (filters.zipCode) query['address.zipCode'] = filters.zipCode;

    // Property characteristics
    if (filters.minUnits) query.numberOfUnits = { $gte: filters.minUnits };
    if (filters.maxUnits) query.numberOfUnits = { ...query.numberOfUnits, $lte: filters.maxUnits };
    if (filters.propertyType) query.type = filters.propertyType;

    // Financial filters
    if (filters.minRent || filters.maxRent) {
      const rentQuery: any = {};
      if (filters.minRent) rentQuery.$gte = filters.minRent;
      if (filters.maxRent) rentQuery.$lte = filters.maxRent;
      query.baseRent = rentQuery;
    }

    // Occupancy filters
    if (filters.occupancyStatus) {
      if (filters.occupancyStatus === 'vacant') {
        query.occupancyRate = { $lt: 100 };
      } else if (filters.occupancyStatus === 'full') {
        query.occupancyRate = 100;
      }
    }

    const properties = await Property.find(query)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return properties;
  }

  async searchTenants(organizationId: string, filters: any): Promise<any> {
    const query: any = { organizationId };

    // Basic filters
    if (filters.name) query.name = { $regex: filters.name, $options: 'i' };
    if (filters.email) query.email = { $regex: filters.email, $options: 'i' };
    if (filters.phone) query.phone = { $regex: filters.phone, $options: 'i' };
    if (filters.status) query.status = filters.status;

    // Property filter
    if (filters.propertyId) query.propertyId = filters.propertyId;

    // Lease filters
    if (filters.leaseExpiring) {
      const daysAhead = filters.leaseExpiring;
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      query.leaseEndDate = { $lte: futureDate, $gte: new Date() };
    }

    // Rent filters
    if (filters.minRent || filters.maxRent) {
      const rentQuery: any = {};
      if (filters.minRent) rentQuery.$gte = filters.minRent;
      if (filters.maxRent) rentQuery.$lte = filters.maxRent;
      query.rentAmount = rentQuery;
    }

    const tenants = await Tenant.find(query)
      .populate('propertyId', 'name address')
      .sort({ createdAt: -1 })
      .lean();

    return tenants;
  }

  private buildSort(sortString: string): any {
    const sortMap: Record<string, any> = {
      'name_asc': { name: 1 },
      'name_desc': { name: -1 },
      'date_asc': { createdAt: 1 },
      'date_desc': { createdAt: -1 },
      'amount_asc': { amount: 1 },
      'amount_desc': { amount: -1 },
      'rent_asc': { rentAmount: 1 },
      'rent_desc': { rentAmount: -1 }
    };

    return sortMap[sortString] || { createdAt: -1 };
  }

  async getSuggestions(organizationId: string, query: string, type: string): Promise<string[]> {
    const limit = 10;
    let suggestions: string[] = [];

    switch (type) {
      case 'properties':
        const properties = await Property.find({
          organizationId,
          name: { $regex: query, $options: 'i' }
        }).select('name').limit(limit).lean();
        suggestions = properties.map(p => p.name);
        break;

      case 'tenants':
        const tenants = await Tenant.find({
          organizationId,
          name: { $regex: query, $options: 'i' }
        }).select('name').limit(limit).lean();
        suggestions = tenants.map(t => t.name);
        break;

      case 'locations':
        const locations = await Property.distinct('address.city', {
          organizationId,
          'address.city': { $regex: query, $options: 'i' }
        }).limit(limit);
        suggestions = locations;
        break;
    }

    return suggestions;
  }
}

export default new SearchService();