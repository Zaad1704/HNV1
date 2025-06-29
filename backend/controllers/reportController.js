"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportMaintenance = exports.generateMonthlyCollectionSheet = exports.exportTenants = exports.exportProperties = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const Property_1 = __importDefault(require("../models/Property"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const axios_1 = __importDefault(require("axios"));
const date_fns_1 = require("date-fns");
// Helper to convert data to CSV format
function convertToCsv(data) {
    if (data.length === 0)
        return '';
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
async function embedImage(doc, url, x, y, options) {
    try {
        const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        doc.image(imageBuffer, x, y, options);
    }
    catch (error) {
        console.error(`Failed to fetch or embed image from ${url}:`, error);
        doc.text('Image not found', x, y);
    }
}
// --- Export Properties ---
const exportProperties = async (req, res, next) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    const { propertyId, format = 'csv' } = req.query;
    const query = { organizationId: req.user.organizationId };
    if (propertyId)
        query._id = propertyId;
    const properties = await Property_1.default.find(query).lean();
    if (format === 'pdf') {
        const doc = new pdfkit_1.default({ margin: 50, layout: 'portrait' });
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
    }
    else {
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
exports.exportProperties = exportProperties;
// --- Export Tenants ---
const exportTenants = async (req, res, next) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    const { tenantId, format = 'csv' } = req.query;
    const query = { organizationId: req.user.organizationId };
    if (tenantId)
        query._id = tenantId;
    const tenants = await Tenant_1.default.find(query).populate('propertyId', 'name').lean();
    if (format === 'pdf') {
        const doc = new pdfkit_1.default({ margin: 50 });
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
            doc.text(`Property: ${tenant.propertyId?.name || 'N/A'}, Unit: ${tenant.unit}`);
            doc.text(`Status: ${tenant.status}`);
            doc.moveDown(2);
        }
        doc.end();
    }
    else {
        const csvData = convertToCsv(tenants.map(t => ({
            id: t._id,
            name: t.name,
            email: t.email,
            phone: t.phone,
            property: t.propertyId?.name,
            unit: t.unit,
            status: t.status,
        })));
        res.header('Content-Type', 'text/csv').attachment('tenants.csv').send(csvData);
    }
};
exports.exportTenants = exportTenants;
// --- Generate Monthly Rent Collection Sheet ---
const generateMonthlyCollectionSheet = async (req, res, next) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    const { month } = req.query;
    const targetMonth = month && typeof month === 'string' ? new Date(month) : new Date();
    const tenants = await Tenant_1.default.find({ organizationId: req.user.organizationId, status: { $in: ['Active', 'Late'] } }).populate('propertyId', 'name').sort({ 'propertyId.name': 1, 'unit': 1 });
    const invoices = await Invoice_1.default.find({
        organizationId: req.user.organizationId,
        dueDate: { $gte: (0, date_fns_1.startOfMonth)(targetMonth), $lte: (0, date_fns_1.endOfMonth)(targetMonth) },
        status: 'overdue'
    });
    const doc = new pdfkit_1.default({ margin: 40 });
    res.setHeader('Content-disposition', `attachment; filename="rent-collection-${(0, date_fns_1.format)(targetMonth, 'yyyy-MM')}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(18).text(`Rent Collection Sheet - ${(0, date_fns_1.format)(targetMonth, 'MMMM<y_bin_46>')}`, { align: 'center' });
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
            `${tenant.propertyId?.name || ''} - ${tenant.unit}`,
            tenant.name,
            tenant.phone || '',
            `$${(tenant.rentAmount || 0).toFixed(2)}`,
            overdueInvoice ? `$${overdueInvoice.amount.toFixed(2)} (${(0, date_fns_1.format)(overdueInvoice.dueDate, 'MMM')})` : '$0.00',
            '[   ]'
        ];
        const y = doc.y;
        row.forEach((text, i) => doc.text(text, x + (i > 0 ? columnWidths.slice(0, i).reduce((a, b) => a + b) : 0), y, { width: columnWidths[i] }));
        doc.moveDown(1);
    });
    doc.end();
};
exports.generateMonthlyCollectionSheet = generateMonthlyCollectionSheet;
// --- Export Maintenance ---
const exportMaintenance = async (req, res, next) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }
    const query = { organizationId: req.user.organizationId };
    // FIX: Safely handle query parameters to avoid "not callable" error
    if (req.query.propertyId && typeof req.query.propertyId === 'string') {
        query.propertyId = req.query.propertyId;
    }
    if (req.query.agentId && typeof req.query.agentId === 'string') {
        query.assignedTo = req.query.agentId;
    }
    if (req.query.tenantId && typeof req.query.tenantId === 'string') {
        query.requestedBy = req.query.tenantId;
    }
    if (req.query.month && typeof req.query.month === 'string') {
        const targetMonth = new Date(req.query.month);
        query.createdAt = { $gte: (0, date_fns_1.startOfMonth)(targetMonth), $lte: (0, date_fns_1.endOfMonth)(targetMonth) };
    }
    const requests = await MaintenanceRequest_1.default.find(query).populate('propertyId', 'name').populate('requestedBy', 'name').lean();
    const csvData = convertToCsv(requests.map((r) => ({
        date: (0, date_fns_1.format)(new Date(r.createdAt), 'yyyy-MM-dd'),
        property: r.propertyId?.name,
        requester: r.requestedBy?.name,
        description: r.description,
        status: r.status,
        priority: r.priority,
    })));
    res.header('Content-Type', 'text/csv').attachment('maintenance.csv').send(csvData);
};
exports.exportMaintenance = exportMaintenance;
//# sourceMappingURL=reportController.js.map