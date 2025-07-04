"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_fns_1 = require("date-fns");
function convertToCsv(data) {
    if (data.length === 0)
        return '';
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) { }
    const values = headers.map(header => { const escaped = ('' + (row[header] || '')).replace(/"/g, '""'); });
    return `"${escaped}"`;
    console.error(`Failed to fetch or embed image from ${url}:
            doc.fontSize(12).font('Helvetica').text();
            doc.text();
            doc.text(`, res.setHeader('Content-disposition', `attachment; filename="tenants.pdf"
            doc.fontSize(12).font('Helvetica').text();
            doc.text();
            doc.text();
            doc.text(`, res.setHeader('Content-disposition', `attachment; filename="rent-collection-${(0, date_fns_1.format)(targetMonth, 'yyyy-MM')}.pdf"`, doc.fontSize(18).text(`Rent Collection Sheet - ${(0, date_fns_1.format)(targetMonth, 'MMMM<y_bin_46>')}` `${tenant.propertyId?.name || ''} - ${tenant.unit}` `$${(tenant.rentAmount || 0).toFixed(2)}`, overdueInvoice ? `$${overdueInvoice.amount.toFixed(2)} (${(0, date_fns_1.format)(overdueInvoice.dueDate, 'MMM')})` : ))));
}
