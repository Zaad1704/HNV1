import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Tenant from '../models/Tenant';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import Expense from '../models/Expense';
import Lease from '../models/Lease';
import { format, subMonths, getDaysInMonth, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

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
        csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
}

export const generateMonthlyCollectionSheet = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }

    try {
        const { forMonth } = req.query;
        const targetMonth = forMonth ? new Date(forMonth as string) : new Date();
        const startOfMonthDate = startOfMonth(targetMonth);
        const endOfMonthDate = endOfMonth(targetMonth);

        const tenants = await Tenant.find({ organizationId: req.user.organizationId }).populate('propertyId', 'name unit').lean();
        const payments = await Payment.find({
            organizationId: req.user.organizationId,
            paymentDate: { $gte: startOfMonthDate, $lte: endOfMonthDate }
        }).lean();

        const collectionData = tenants.map(tenant => {
            const tenantPayments = payments.filter(p => p.tenantId.toString() === tenant._id.toString());
            const totalPaid = tenantPayments.reduce((sum, p) => sum + p.amount, 0);
            
            return {
                tenantName: tenant.name,
                propertyName: (tenant.propertyId as any)?.name || 'N/A',
                unit: tenant.unit,
                expectedRent: tenant.rentAmount || 0,
                paidAmount: totalPaid,
                balance: (tenant.rentAmount || 0) - totalPaid,
                paymentStatus: (tenant.rentAmount || 0) <= totalPaid ? 'Paid' : 'Unpaid',
            };
        });

        res.status(200).json({ success: true, data: collectionData });

    } catch (error) {
        console.error("Error generating monthly collection sheet:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getTenantMonthlyStatement = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }

    const { tenantId } = req.params;
    const { startMonth, endMonth } = req.query;

    try {
        const tenant = await Tenant.findById(tenantId);
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Tenant not found in your organization.' });
            return;
        }

        const startDate = startMonth ? new Date(startMonth as string) : subMonths(new Date(), 11);
        const endDate = endMonth ? new Date(endMonth as string) : new Date();

        const months = eachMonthOfInterval({ start: startOfMonth(startDate), end: startOfMonth(endDate) });

        let cumulativeBalance = 0;
        const statement: any[] = [];

        for (const month of months) {
            const monthStart = startOfMonth(month);
            const monthEnd = endOfMonth(month);

            const invoices = await Invoice.find({
                tenantId: tenant._id,
                dueDate: { $gte: monthStart, $lte: monthEnd }
            }).lean();

            const expectedDue = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

            const payments = await Payment.find({
                tenantId: tenant._id,
                paymentDate: { $gte: monthStart, $lte: monthEnd }
            }).lean();

            const amountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

            const monthlyBalance = amountPaid - expectedDue;
            cumulativeBalance += monthlyBalance;

            statement.push({
                month: format(monthStart, 'yyyy-MM'),
                expectedDue: expectedDue,
                amountPaid: amountPaid,
                monthlyBalance: monthlyBalance,
                cumulativeBalance: cumulativeBalance,
                invoices: invoices.map(inv => ({
                    id: inv._id.toString(),
                    invoiceNumber: inv.invoiceNumber,
                    amount: inv.amount,
                    status: inv.status,
                    dueDate: inv.dueDate.toISOString().split('T')[0],
                })),
                payments: payments.map(pay => ({
                    id: pay._id.toString(),
                    amount: pay.amount,
                    date: pay.paymentDate.toISOString().split('T')[0],
                })),
            });
        }

        res.status(200).json({ success: true, tenantName: tenant.name, data: statement });

    } catch (error) {
        console.error("Error generating tenant statement:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const generateTenantProfilePdf = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }

    try {
        const { tenantId } = req.params;
        const tenant = await Tenant.findById(tenantId)
            .populate('propertyId', 'name address')
            .lean();

        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Tenant not found.' });
            return;
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        const filename = `TenantProfile-${tenant.name.replace(/\s/g, '_')}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Tenant Profile', { align: 'center' }).moveDown();
        doc.fontSize(14).text(`Name: ${tenant.name}`).moveDown(0.5);
        doc.text(`Email: ${tenant.email}`).moveDown(0.5);
        doc.text(`Phone: ${tenant.phone || 'N/A'}`).moveDown(0.5);
        doc.text(`Property: ${(tenant.propertyId as any)?.name || 'N/A'}`).moveDown(0.5);
        doc.text(`Unit: ${tenant.unit}`).moveDown(0.5);
        doc.text(`Lease End Date: ${tenant.leaseEndDate ? format(tenant.leaseEndDate, 'PPP') : 'N/A'}`).moveDown(0.5);
        doc.text(`Monthly Rent: $${tenant.rentAmount?.toFixed(2) || '0.00'}`).moveDown(2);

        doc.fontSize(16).text('Personal Details').moveDown();
        doc.fontSize(12).text(`Father's Name: ${tenant.fatherName || 'N/A'}`).moveDown(0.5);
        doc.text(`Mother's Name: ${tenant.motherName || 'N/A'}`).moveDown(0.5);
        doc.text(`Permanent Address: ${tenant.permanentAddress || 'N/A'}`).moveDown(0.5);
        doc.text(`Govt ID Number: ${tenant.govtIdNumber || 'N/A'}`).moveDown(2);
        
        if (tenant.reference?.name) {
            doc.fontSize(16).text('Reference Information').moveDown();
            doc.fontSize(12).text(`Reference Name: ${tenant.reference.name}`).moveDown(0.5);
            doc.text(`Reference Phone: ${tenant.reference.phone || 'N/A'}`).moveDown(0.5);
            doc.text(`Reference ID: ${tenant.reference.idNumber || 'N/A'}`).moveDown(2);
        }

        if (tenant.additionalAdults && tenant.additionalAdults.length > 0) {
            doc.fontSize(16).text('Additional Occupants').moveDown();
            tenant.additionalAdults.forEach((adult, index) => {
                doc.fontSize(12).text(`${index + 1}. Name: ${adult.name}, Phone: ${adult.phone || 'N/A'}`).moveDown(0.5);
            });
            doc.moveDown(2);
        }

        doc.end();

    } catch (error) {
        console.error("Error generating tenant profile PDF:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const exportTenantsAsCsv = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }

    try {
        const { propertyId } = req.query;
        const query: any = { organizationId: req.user.organizationId };

        if (propertyId && propertyId !== 'all') {
            query.propertyId = propertyId;
        }

        const tenants = await Tenant.find(query).populate('propertyId', 'name address').lean();

        const flattenedTenants = tenants.map(t => ({
            name: t.name,
            email: t.email,
            phone: t.phone || '',
            propertyName: (t.propertyId as any)?.name || 'N/A',
            propertyAddress: (t.propertyId as any)?.address?.formattedAddress || 'N/A',
            unit: t.unit,
            status: t.status,
            leaseEndDate: t.leaseEndDate ? format(t.leaseEndDate, 'yyyy-MM-dd') : '',
            rentAmount: t.rentAmount || 0,
            fatherName: t.fatherName || '',
            motherName: t.motherName || '',
            permanentAddress: t.permanentAddress || '',
            govtIdNumber: t.govtIdNumber || '',
            referenceName: t.reference?.name || '',
            referencePhone: t.reference?.phone || '',
            referenceIdNumber: t.reference?.idNumber || '',
            additionalAdults: t.additionalAdults && t.additionalAdults.length > 0
                                ? JSON.stringify(t.additionalAdults.map(a => `${a.name}${a.phone ? ` (${a.phone})` : ''}`))
                                : '',
        }));

        const csvData = convertToCsv(flattenedTenants);

        res.header('Content-Type', 'text/csv');
        res.attachment('tenants-export.csv');
        res.status(200).send(csvData);

    } catch (error) {
        console.error("CSV Export Error:", error);
        res.status(500).send('Error generating CSV file.');
    }
};

export const exportExpensesAsCsv = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }

    try {
        const { propertyId, agentId, startDate, endDate } = req.query;
        const query: any = { organizationId: req.user.organizationId };

        if (propertyId) query.propertyId = propertyId;
        if (agentId) query.paidToAgentId = agentId;
        if (startDate && endDate) {
            query.date = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
        }

        const expenses = await Expense.find(query)
            .populate('propertyId', 'name')
            .populate('paidToAgentId', 'name')
            .sort({ date: -1 })
            .lean();

        const flattenedExpenses = expenses.map(e => ({
            date: new Date(e.date).toISOString().split('T')[0],
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

    } catch (error) {
        console.error("CSV Export Error:", error);
        res.status(500).send('Error generating CSV file.');
    }
};
