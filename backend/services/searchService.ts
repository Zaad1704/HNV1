import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import MaintenanceRequest from '../models/MaintenanceRequest';

interface SearchQuery { query: string;
  filters: Record<string, any>;
  sort: string;
  page: number;

  limit: number; }


class SearchService { async globalSearch(organizationId: string, searchQuery: SearchQuery): Promise<any> { }

    const { query, filters, sort, page, limit } = searchQuery;
    const skip = (page - 1) * limit;

    const baseQuery: any = { organizationId };
    
    const textSearch = query ? { $or: [ }

        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    } : {};

    const propertyQuery = { ...baseQuery, ...textSearch };
    if (filters.propertyType) propertyQuery.type = filters.propertyType;
    if (filters.status) propertyQuery.status = filters.status;

    const properties = await Property.find(propertyQuery)
      .sort(this.buildSort(sort))
      .skip(skip)
      .limit(limit)
      .lean();

    const tenantQuery = { ...baseQuery, ...textSearch };
    if (filters.leaseStatus) tenantQuery.status = filters.leaseStatus;

    const tenants = await Tenant.find(tenantQuery)
      .populate('propertyId', 'name')
      .sort(this.buildSort(sort))
      .skip(skip)
      .limit(limit)
      .lean();

    const paymentQuery = { ...baseQuery };
    if (query) { paymentQuery.$or = [ }


        { description: { $regex: query, $options: 'i' } },
        { transactionId: { $regex: query, $options: 'i' } }
      ];

    if (filters.paymentStatus) paymentQuery.status = filters.paymentStatus;
    if (filters.dateRange) { paymentQuery.paymentDate = { }
        $gte: new Date(filters.dateRange.start),
        $lte: new Date(filters.dateRange.end)


      };

    const payments = await Payment.find(paymentQuery)
      .populate('tenantId', 'name')
      .populate('propertyId', 'name')
      .sort(this.buildSort(sort))
      .skip(skip)
      .limit(limit)
      .lean();

    const maintenanceQuery = { ...baseQuery };
    if (query) { maintenanceQuery.$or = [ }


        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];

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

  private buildSort(sortString: string): any { const sortMap: Record<string, any> = { }

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

  async getSuggestions(organizationId: string, query: string, type: string): Promise<string[]> { const limit = 10;
    let suggestions: string[] = [];

    switch (type) { }
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

    return suggestions;


export default new SearchService();