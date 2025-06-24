import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import Tenant from '../models/Tenant';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import Expense from '../models/Expense';
import Lease from '../models/Lease';
import { format, subMonths, getDaysInMonth, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

// Helper to convert data to CSV format
function convertToCsv(data: any[]): string {
    if (data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'object') {
                value = JSON.stringify(value);
            }
            const stringValue = String(value).replace(/"/g, '""');
            return `"${stringValue}"`;
        });
        csvRows.push(values.join(',')); // Corrected from \n to ,
    }
    return csvRows.join('\n');
}

// Helper to generate a PDF table
function generatePdfTable(doc: PDFKit.PDFDocument, tableTop: number, headers: string[], data: any[][]) {
    doc.font('Helvetica-Bold');
    let x = 50;
    const columnWidth = (doc.page.width - 100) / headers.length;
    headers.forEach(header => {
        doc.text(header, x, tableTop, { width: columnWidth, align: 'left' });
        x += columnWidth;
    });
    doc.moveTo(50, tableTop + 20).lineTo(doc.page.width - 50, tableTop + 20).stroke();

    doc.font('Helvetica');
    let y = tableTop + 30;
    data.forEach(row => {
        x = 50;
        row.forEach(cell => {
            doc.text(String(cell), x, y, { width: columnWidth, align: 'left' });
            x += columnWidth;
        });
        y += 20;
        if (y > doc.page.height - 50) {
            doc.addPage();
            y = 50;
        }
    });
}


export const exportTenants = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }

    const { propertyId, format: fileFormat = 'csv' } = req.query;
    const query: any = { organizationId: req.user.organizationId };

    if (propertyId && propertyId !== 'all') {
        query.propertyId = propertyId;
    }

    const tenants = await Tenant.find(query).populate('propertyId', 'name').lean();
    
    if (fileFormat === 'pdf') {
        const doc = new PDFDocument({ layout: 'landscape', margin: 50 });
        const filename = `tenants-export-${new Date().toISOString().split('T')[0]}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);

        doc.fontSize(18).text('Tenant Report', { align: 'center' });
        doc.moveDown();

        const headers = ['Name', 'Email', 'Property', 'Unit', 'Status', 'Rent', 'Lease End'];
        const data = tenants.map(t => [
            t.name,
            t.email,
            (t.propertyId as any)?.name || 'N/A',
            t.unit,
            t.status,
            `$${(t.rentAmount || 0).toFixed(2)}`,
            t.leaseEndDate ? format(new Date(t.leaseEndDate), 'yyyy-MM-dd') : 'N/A',
        ]);

        generatePdfTable(doc, 150, headers, data);

        doc.end();
    } else {
        const flattenedTenants = tenants.map(t => ({
            name: t.name,
            email: t.email,
            phone: t.phone || '',
            propertyName: (t.propertyId as any)?.name || 'N/A',
            unit: t.unit,
            status: t.status,
            leaseEndDate: t.leaseEndDate ? format(new Date(t.leaseEndDate), 'yyyy-MM-dd') : '',
            rentAmount: t.rentAmount || 0,
        }));
        const csvData = convertToCsv(flattenedTenants);
        res.header('Content-Type', 'text/csv');
        res.attachment('tenants-export.csv');
        res.status(200).send(csvData);
    }
};

export const exportExpenses = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
     const { propertyId, agentId, startDate, endDate, format: fileFormat = 'csv' } = req.query;
    const query: any = { organizationId: req.user.organizationId };
    if (propertyId) query.propertyId = propertyId;
    if (agentId) query.paidToAgentId = agentId;
    if (startDate && endDate) {
        query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    const expenses = await Expense.find(query).populate('propertyId', 'name').populate('paidToAgentId', 'name').sort({ date: -1 }).lean();

    if (fileFormat === 'pdf') {
        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-disposition', `attachment; filename="expenses-export.pdf"`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);
        doc.fontSize(18).text('Expense Report', { align: 'center' });
        doc.moveDown();
        const headers = ['Date', 'Description', 'Category', 'Amount', 'Property'];
        const data = expenses.map(e => [
            format(new Date(e.date), 'yyyy-MM-dd'),
            e.description,
            e.category,
            `$${e.amount.toFixed(2)}`,
            (e.propertyId as any)?.name || 'N/A',
        ]);
        generatePdfTable(doc, 150, headers, data);
        doc.end();
    } else {
        const flattenedExpenses = expenses.map(e => ({
            date: format(new Date(e.date), 'yyyy-MM-dd'),
            description: e.description,
            category: e.category,
            amount: e.amount,
            property: (e.propertyId as any)?.name,
            paidToAgent: (e.paidToAgentId as any)?.name || '',
        }));
        const csvData = convertToCsv(flattenedExpenses);
        res.header('Content-Type', 'text/csv');
        res.attachment('expenses-export.csv');
        res.status(200).send(csvData);
    }
};

export const generateMonthlyCollectionSheet = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation needed
    res.status(501).json({ success: false, message: 'Not implemented' });
};
export const getTenantMonthlyStatement = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation needed
     res.status(501).json({ success: false, message: 'Not implemented' });
};
export const generateTenantProfilePdf = async (req: Request, res: Response, next: NextFunction) => {
    // Implementation needed
     res.status(501).json({ success: false, message: 'Not implemented' });
};
