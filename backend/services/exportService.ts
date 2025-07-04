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

      // Update request with result
      const stats = fs.statSync(filePath);
      const fileName = path.basename(filePath);
      
      request.status = 'completed';
      request.progress = 100;
      request.result = {
        fileUrl: `/api/export/download/${request._id}
    const fileName = `${request.type}_export_${Date.now()}.pdf
    doc.fontSize(20).text(`${request.type.toUpperCase()} Export
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}
    doc.fontSize(12).text(`Records: ${data.length}
    const fileName = `${request.type}_export_${Date.now()}.csv
        return `$${Number(value).toFixed(2)}