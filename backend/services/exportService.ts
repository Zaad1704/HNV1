import PDFDocument from 'pdfkit';
import { Parser } from 'json2csv';
import ExportRequest, { IExportRequest } from '../models/ExportRequest';
import ExportTemplate from '../models/ExportTemplate';
import Property from '../models/Property';
import Tenant from '../models/Tenant';
import Payment from '../models/Payment';
import MaintenanceRequest from '../models/MaintenanceRequest';
import Expense from '../models/Expense';
import RentCollectionPeriod from '../models/RentCollectionPeriod';
import CollectionAction from '../models/CollectionAction';
import fs from 'fs';
import path from 'path';

class ExportService {
  private uploadsDir = path.join(__dirname, '../uploads/exports');

  constructor() {
    // Ensure uploads directory exists
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async createExportRequest(data: Partial<IExportRequest>): Promise<IExportRequest> {
    const exportRequest = new ExportRequest({
      ...data,
      status: 'pending',
      progress: 0
    });

    await exportRequest.save();
    
    // Process export in background
    this.processExport(exportRequest._id.toString()).catch(console.error);
    
    return exportRequest;
  }

  async processExport(requestId: string): Promise<void> {
    try {
      const request = await ExportRequest.findById(requestId);
      if (!request) throw new Error('Export request not found');

      // Update status to processing
      request.status = 'processing';
      request.progress = 10;
      await request.save();

      // Get data based on type
      const data = await this.getData(request);
      request.progress = 50;
      await request.save();

      // Generate file based on format
      let filePath: string;
      if (request.format === 'pdf') {
        filePath = await this.generatePDF(data, request);
      } else if (request.format === 'csv') {
        filePath = await this.generateCSV(data, request);
      } else {
        throw new Error('Unsupported format');
      }

      // Update request with result
      const stats = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      
      request.status = 'completed';
      request.progress = 100;
      request.result = {
        fileUrl: `/api/export/download/${request._id}`,
        fileName,
        fileSize: stats.size,
        recordCount: Array.isArray(data) ? data.length : 0,
        generatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };

      await request.save();
    } catch (error: any) {
      const request = await ExportRequest.findById(requestId);
      if (request) {
        request.status = 'failed';
        request.error = {
          message: error.message,
          details: error.stack
        };
        await request.save();
      }
    }
  }

  private async getData(request: IExportRequest): Promise<any[]> {
    const { type, filters, organizationId } = request;
    let query: any = { organizationId };

    // Apply filters
    if (filters.dateRange) {
      query.createdAt = {
        $gte: filters.dateRange.start,
        $lte: filters.dateRange.end
      };
    }

    if (filters.properties && filters.properties.length > 0) {
      query.propertyId = { $in: filters.properties };
    }

    if (filters.status && filters.status.length > 0) {
      query.status = { $in: filters.status };
    }

    let data: any[] = [];

    switch (type) {
      case 'properties':
        data = await Property.find(query)
          .populate('createdBy', 'name')
          .populate('managedByAgentId', 'name')
          .lean();
        break;

      case 'tenants':
        data = await Tenant.find(query)
          .populate('propertyId', 'name address')
          .lean();
        break;

      case 'payments':
        data = await Payment.find(query)
          .populate('tenantId', 'name')
          .populate('propertyId', 'name')
          .lean();
        break;

      case 'maintenance':
        data = await MaintenanceRequest.find(query)
          .populate('propertyId', 'name')
          .populate('tenantId', 'name')
          .lean();
        break;

      case 'expenses':
        data = await Expense.find(query)
          .populate('propertyId', 'name')
          .lean();
        break;

      case 'rent_collection':
        data = await RentCollectionPeriod.find(query)
          .lean();
        break;

      case 'collection_actions':
        data = await CollectionAction.find(query)
          .populate('tenantId', 'name')
          .populate('userId', 'name')
          .lean();
        break;

      default:
        throw new Error('Invalid export type');
    }

    return data;
  }

  private async generatePDF(data: any[], request: IExportRequest): Promise<string> {
    const fileName = `${request.type}_export_${Date.now()}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(20).text(`${request.type.toUpperCase()} Export`, 50, 50);
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, 50, 80);
    doc.fontSize(12).text(`Records: ${data.length}`, 50, 100);

    // Table headers
    let yPosition = 140;
    const columns = this.getColumnsForType(request.type);
    
    doc.fontSize(10).fillColor('#000');
    columns.forEach((col, index) => {
      doc.text(col.label, 50 + (index * 100), yPosition, { width: 90 });
    });

    yPosition += 20;
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 10;

    // Table data
    data.forEach((item, rowIndex) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      columns.forEach((col, colIndex) => {
        const value = this.getNestedValue(item, col.field) || '';
        const displayValue = this.formatValue(value, col.format);
        doc.text(displayValue.toString().substring(0, 15), 50 + (colIndex * 100), yPosition, { width: 90 });
      });

      yPosition += 15;
    });

    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => resolve(filePath));
      doc.on('error', reject);
    });
  }

  private async generateCSV(data: any[], request: IExportRequest): Promise<string> {
    const fileName = `${request.type}_export_${Date.now()}.csv`;
    const filePath = path.join(this.uploadsDir, fileName);

    const columns = this.getColumnsForType(request.type);
    const fields = columns.map(col => ({
      label: col.label,
      value: col.field
    }));

    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    fs.writeFileSync(filePath, csv);
    return filePath;
  }

  private getColumnsForType(type: string) {
    const columnMaps: Record<string, any[]> = {
      properties: [
        { field: 'name', label: 'Name', format: 'text' },
        { field: 'address.street', label: 'Address', format: 'text' },
        { field: 'numberOfUnits', label: 'Units', format: 'number' },
        { field: 'status', label: 'Status', format: 'text' },
        { field: 'createdAt', label: 'Created', format: 'date' }
      ],
      tenants: [
        { field: 'name', label: 'Name', format: 'text' },
        { field: 'email', label: 'Email', format: 'text' },
        { field: 'phone', label: 'Phone', format: 'text' },
        { field: 'propertyId.name', label: 'Property', format: 'text' },
        { field: 'status', label: 'Status', format: 'text' }
      ],
      payments: [
        { field: 'amount', label: 'Amount', format: 'currency' },
        { field: 'tenantId.name', label: 'Tenant', format: 'text' },
        { field: 'propertyId.name', label: 'Property', format: 'text' },
        { field: 'paymentDate', label: 'Date', format: 'date' },
        { field: 'status', label: 'Status', format: 'text' }
      ],
      maintenance: [
        { field: 'title', label: 'Title', format: 'text' },
        { field: 'propertyId.name', label: 'Property', format: 'text' },
        { field: 'priority', label: 'Priority', format: 'text' },
        { field: 'status', label: 'Status', format: 'text' },
        { field: 'createdAt', label: 'Created', format: 'date' }
      ],
      expenses: [
        { field: 'description', label: 'Description', format: 'text' },
        { field: 'amount', label: 'Amount', format: 'currency' },
        { field: 'category', label: 'Category', format: 'text' },
        { field: 'date', label: 'Date', format: 'date' },
        { field: 'propertyId.name', label: 'Property', format: 'text' }
      ],
      rent_collection: [
        { field: 'period.month', label: 'Month', format: 'number' },
        { field: 'period.year', label: 'Year', format: 'number' },
        { field: 'summary.expectedRent', label: 'Expected', format: 'currency' },
        { field: 'summary.collectedRent', label: 'Collected', format: 'currency' },
        { field: 'summary.collectionRate', label: 'Rate %', format: 'number' }
      ],
      collection_actions: [
        { field: 'tenantId.name', label: 'Tenant', format: 'text' },
        { field: 'type', label: 'Action Type', format: 'text' },
        { field: 'details.outcome', label: 'Outcome', format: 'text' },
        { field: 'details.notes', label: 'Notes', format: 'text' },
        { field: 'createdAt', label: 'Date', format: 'date' }
      ]
    };

    return columnMaps[type] || [];
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private formatValue(value: any, format?: string): string {
    if (value === null || value === undefined) return '';

    switch (format) {
      case 'currency':
        return `$${Number(value).toFixed(2)}`;
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'number':
        return Number(value).toString();
      default:
        return value.toString();
    }
  }

  async getExportStatus(requestId: string): Promise<IExportRequest | null> {
    return await ExportRequest.findById(requestId);
  }

  async getExportFile(requestId: string): Promise<string | null> {
    const request = await ExportRequest.findById(requestId);
    if (!request || request.status !== 'completed' || !request.result?.fileName) {
      return null;
    }

    const filePath = path.join(this.uploadsDir, request.result.fileName);
    return fs.existsSync(filePath) ? filePath : null;
  }

  async cleanupExpiredExports(): Promise<void> {
    const expiredRequests = await ExportRequest.find({
      'result.expiresAt': { $lt: new Date() },
      status: 'completed'
    });

    for (const request of expiredRequests) {
      if (request.result?.fileName) {
        const filePath = path.join(this.uploadsDir, request.result.fileName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
      await ExportRequest.findByIdAndDelete(request._id);
    }
  }
}

export default new ExportService();