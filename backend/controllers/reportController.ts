import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import Tenant from '../models/Tenant';
import MaintenanceRequest, { IMaintenanceRequest } from '../models/MaintenanceRequest';
import Property from '../models/Property';
import Invoice from '../models/Invoice';
import axios from 'axios';
import { format, startOfMonth, endOfMonth } from 'date-fns';

// Helper to convert data to CSV format
function convertToCsv(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + (row[header] || '')).replace(/"/g, '""');
            return `"${escaped}"
        console.error(`Failed to fetch or embed image from ${url}:
            doc.fontSize(12).font('Helvetica').text(
            doc.text(
            doc.text(
        res.setHeader('Content-disposition', `attachment; filename="tenants.pdf"
            doc.fontSize(12).font('Helvetica').text(
            doc.text(
            doc.text(
            doc.text(
    res.setHeader('Content-disposition', `attachment; filename="rent-collection-${format(targetMonth, 'yyyy-MM')}.pdf"
    doc.fontSize(18).text(`Rent Collection Sheet - ${format(targetMonth, 'MMMM<y_bin_46>')}
            `${(tenant.propertyId as any)?.name || ''} - ${tenant.unit}
            `$${(tenant.rentAmount || 0).toFixed(2)}
            overdueInvoice ? `$${overdueInvoice.amount.toFixed(2)} (${format(overdueInvoice.dueDate, 'MMM')})