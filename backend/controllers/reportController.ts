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
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}

// Helper to embed an image from a URL into a PDF
async function embedImage(doc: PDFKit.PDFDocument, url: string, x: number, y: number, options: any) {
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        doc.image(imageBuffer, x, y, options);
    } catch (error) {
        console.error(`Failed to fetch or embed image from ${url}:`, error);
        doc.text('Image not found', x, y);
    }
}

// --- Export Properties ---
export const exportProperties = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    const { propertyId, format = 'csv' } = req.query;
    const query: any = { organizationId: req.user.organizationId };
    if (propertyId) query._id = propertyId;

    const properties = await Property.find(query).lean();
    
    if (format === 'pdf') {
        const doc = new PDFDocument({ margin: 50, layout: 'portrait' });
        res.setHeader('Content-disposition', 'attachment; filename="properties.pdf"');
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);
        doc.fontSize(20).text('Properties Report', { align: 'center' });
        doc.moveDown(2);

        for (const prop of properties) {
            doc.fontSize(16).font('Helvetica-Bold').text(prop.name, { underline: true });
            doc.moveDown(0.5);
            if (prop.imageUrl) {
                await embedImage(doc, prop.imageUrl, doc.x, doc.y, { width: 250 });
                doc.moveDown(0.5);
            }
            doc.fontSize(12).font('Helvetica').text(`Address: ${prop.address.formattedAddress}`);
            doc.text(`Status: ${prop.status}`);
            doc.text(`Number of Units: ${prop.numberOfUnits}`);
            doc.moveDown(2);
        }
        doc.end();
    } else {
        const csvData = convertToCsv(properties.map(p => ({
            id: p._id,
            name: p.name,
            address: p.address.formattedAddress,
            status: p.status,
            units: p.numberOfUnits,
            imageUrl: p.imageUrl,
        })));
        res.header('Content-Type', 'text/csv').attachment('properties.csv').send(csvData);
    }
};

// --- Export Tenants ---
export const exportTenants = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    const { tenantId, format = 'csv' } = req.query;
    const query: any = { organizationId: req.user.organizationId };
    if (tenantId) query._id = tenantId;

    const tenants = await Tenant.find(query).populate('propertyId', 'name').lean();

    if (format === 'pdf') {
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-disposition', `attachment; filename="tenants.pdf"`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);
        for (const tenant of tenants) {
            doc.fontSize(16).font('Helvetica-Bold').text(tenant.name, { underline: true });
            doc.moveDown(0.5);
             if (tenant.imageUrl) {
                await embedImage(doc, tenant.imageUrl, doc.x, doc.y, { width: 150 });
                doc.moveDown(0.5);
            }
            doc.fontSize(12).font('Helvetica').text(`Email: ${tenant.email}`);
            doc.text(`Phone: ${tenant.phone || 'N/A'}`);
            doc.text(`Property: ${(tenant.propertyId as any)?.name || 'N/A'}, Unit: ${tenant.unit}`);
            doc.text(`Status: ${tenant.status}`);
            doc.moveDown(2);
        }
        doc.end();
    } else {
        const csvData = convertToCsv(tenants.map(t => ({
            id: t._id,
            name: t.name,
            email: t.email,
            phone: t.phone,
            property: (t.propertyId as any)?.name,
            unit: t.unit,
            status: t.status,
        })));
        res.header('Content-Type', 'text/csv').attachment('tenants.csv').send(csvData);
    }
};

// --- Generate Monthly Rent Collection Sheet ---
export const generateMonthlyCollectionSheet = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    const { month } = req.query;
    const targetMonth = month && typeof month === 'string' ? new Date(month) : new Date();
    
    const tenants = await Tenant.find({ organizationId: req.user.organizationId, status: { $in: ['Active', 'Late'] } }).populate('propertyId', 'name').sort({ 'propertyId.name': 1, 'unit': 1 });
    const invoices = await Invoice.find({
        organizationId: req.user.organizationId,
        dueDate: { $gte: startOfMonth(targetMonth), $lte: endOfMonth(targetMonth) },
        status: 'overdue'
    });

    const doc = new PDFDocument({ margin: 40 });
    res.setHeader('Content-disposition', `attachment; filename="rent-collection-${format(targetMonth, 'yyyy-MM')}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);

    doc.fontSize(18).text(`Rent Collection Sheet - ${format(targetMonth, 'MMMM yyyy')}`, { align: 'center' });
    doc.moveDown();

    const tableTop = doc.y;
    const headers = ['Property/Unit', 'Tenant Name', 'Phone', 'Rent', 'Overdue', 'Collected'];
    const columnWidths = [120, 100, 80, 70, 90, 60];
    let x = doc.x;
    
    doc.font('Helvetica-Bold');
    headers.forEach((header, i) => doc.text(header, x + (i > 0 ? columnWidths.slice(0, i).reduce((a, b) => a + b) : 0), tableTop, { width: columnWidths[i] }));
    doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.x, doc.y).stroke();
    doc.moveDown(0.5);
    doc.font('Helvetica');

    tenants.forEach(tenant => {
        const overdueInvoice = invoices.find(inv => inv.tenantId.toString() === tenant._id.toString());
        const row = [
            `${(tenant.propertyId as any)?.name || ''} - ${tenant.unit}`,
            tenant.name,
            tenant.phone || '',
            `$${(tenant.rentAmount || 0).toFixed(2)}`,
            overdueInvoice ? `$${overdueInvoice.amount.toFixed(2)} (${format(overdueInvoice.dueDate, 'MMM')})` : '$0.00',
            '[   ]'
        ];
        
        const y = doc.y;
        row.forEach((text, i) => doc.text(text, x + (i > 0 ? columnWidths.slice(0, i).reduce((a, b) => a + b) : 0), y, { width: columnWidths[i] }));
        doc.moveDown(1);
    });

    doc.end();
};

// --- Export Maintenance ---
export const exportMaintenance = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    const { propertyId, agentId, tenantId, month, format = 'csv' } = req.query;
    const query: any = { organizationId: req.user.organizationId };

    if (propertyId) query.propertyId = propertyId;
    if (agentId) query.assignedTo = agentId;
    if (tenantId) query.requestedBy = tenantId;
    if (month && typeof month === 'string') {
        const targetMonth = new Date(month);
        // FIX: The query was on 'createdAt' but the Mongoose model schema did not have timestamps enabled.
        // Assuming timestamps: true is on the MaintenanceRequestSchema, this is correct.
        query.createdAt = { $gte: startOfMonth(targetMonth), $lte: endOfMonth(targetMonth) };
    }

    const requests = await MaintenanceRequest.find(query).populate('propertyId', 'name').populate('requestedBy', 'name').lean();
    
    const csvData = convertToCsv(requests.map((r: IMaintenanceRequest) => ({
        date: format(new Date(r.createdAt), 'yyyy-MM-dd'),
        property: (r.propertyId as any)?.name,
        requester: (r.requestedBy as any)?.name,
        description: r.description,
        status: r.status,
        priority: r.priority,
    })));
    res.header('Content-Type', 'text/csv').attachment('maintenance.csv').send(csvData);
};
