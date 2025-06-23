import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import Tenant from '../models/Tenant';
import Invoice from '../models/Invoice';
import Payment from '../models/Payment';
import Lease from '../models/Lease';
import { format, subMonths, getDaysInMonth, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

export const generateMonthlyCollectionSheet = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }

    try {
        const activeTenants = await Tenant.find({ 
            organizationId: req.user.organizationId,
            status: 'Active' 
        }).populate('propertyId', 'name');

        const doc = new PDFDocument({ layout: 'landscape', margin: 30 });

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const currentMonth = monthNames[new Date().getMonth()];
        const currentYear = new Date().getFullYear();
        
        const filename = `Rent-Collection-Sheet-${currentMonth}-${currentYear}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(16).font('Helvetica-Bold').text(`Rent Collection Sheet: ${currentMonth} ${currentYear}`, { align: 'center' });
        doc.moveDown(2);

        const tableTop = doc.y;
        const col1X = 30, col2X = 180, col3X = 330, col4X = 420, col5X = 510, col6X = 630;
        
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Property / Unit', col1X, tableTop);
        doc.text('Tenant Name', col2X, tableTop);
        doc.text('Rent Amount', col3X, tableTop, { width: 90, align: 'center' });
        doc.text('Amount Paid', col4X, tableTop, { width: 90, align: 'center' });
        doc.text('Date Paid', col5X, tableTop, { width: 90, align: 'center' });
        doc.text('Signature / Initials', col6X, tableTop, { width: 120, align: 'center' });
        doc.moveTo(col1X, tableTop + 15).lineTo(col6X + 150, tableTop + 15).stroke();

        let rowY = tableTop + 20;
        doc.font('Helvetica').fontSize(9);

        for (const tenant of activeTenants) {
            doc.text(`${(tenant.propertyId as any).name}, Unit ${tenant.unit}`, col1X, rowY, { width: 140 });
            doc.text(tenant.name, col2X, rowY, { width: 140 });
            doc.text(`$${(tenant.rentAmount || 0).toFixed(2)}`, col3X, rowY, { width: 90, align: 'center' });
            
            doc.rect(col4X + 10, rowY - 5, 70, 20).stroke();
            doc.rect(col5X + 10, rowY - 5, 70, 20).stroke();
            doc.rect(col6X + 10, rowY - 5, 120, 20).stroke();

            rowY += 25;
            if (rowY > 550) {
                doc.addPage({ layout: 'landscape', margin: 30 });
                rowY = 50;
            }
        }

        doc.end();

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const getTenantMonthlyStatement = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }

    const { tenantId } = req.params;
    const { startMonth, endMonth } = req.query;

    try {
        const tenant = await Tenant.findById(tenantId);
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found or access denied.' });
        }

        const today = new Date();
        const endDate = endMonth ? endOfMonth(new Date(String(endMonth))) : endOfMonth(today);
        const startDate = startMonth ? startOfMonth(new Date(String(startMonth))) : startOfMonth(subMonths(today, 11));

        const months = eachMonthOfInterval({ start: startDate, end: endDate });

        const statement = [];
        let runningBalance = 0;

        for (const monthStart of months) {
            const monthEnd = endOfMonth(monthStart);
            const formattedMonth = format(monthStart, 'MMM yyyy');

            const invoices = await Invoice.find({
                tenantId: tenant._id,
                dueDate: { $gte: monthStart, $lte: monthEnd },
            }).sort({ dueDate: 1 });

            let expectedDue = 0;
            for (const inv of invoices) {
                expectedDue += inv.amount;
            }
            
            let effectiveRentForMonth = tenant.rentAmount || 0;
            if (tenant.discountAmount && tenant.discountAmount > 0 && 
                tenant.discountExpiresAt && tenant.discountExpiresAt >= monthStart) {
                effectiveRentForMonth = Math.max(0, effectiveRentForMonth - tenant.discountAmount);
                expectedDue = effectiveRentForMonth;
            }

            const payments = await Payment.find({
                tenantId: tenant._id,
                paymentDate: { $gte: monthStart, $lte: monthEnd },
                status: 'Paid',
            });

            const amountPaid = payments.reduce((sum, p) => sum + p.amount, 0);

            const monthlyBalanceChange = amountPaid - expectedDue;
            runningBalance += monthlyBalanceChange;

            statement.push({
                month: formattedMonth,
                expectedDue: expectedDue,
                amountPaid: amountPaid,
                monthlyBalance: monthlyBalanceChange,
                cumulativeBalance: runningBalance,
                invoices: invoices.map(inv => ({
                    id: inv._id,
                    invoiceNumber: inv.invoiceNumber,
                    amount: inv.amount,
                    status: inv.status,
                    dueDate: format(inv.dueDate, 'PPP')
                })),
                payments: payments.map(p => ({
                    id: p._id,
                    amount: p.amount,
                    date: format(p.paymentDate, 'PPP')
                })),
            });
        }

        res.status(200).json({ success: true, data: statement, tenantName: tenant.name });

    } catch (error) {
        console.error('Error generating tenant monthly statement:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

/**
 * @desc    Generate a detailed PDF profile for a single tenant
 * @route   GET /api/reports/tenant-profile/:tenantId/pdf
 * @access  Private (Landlord, Agent)
 */
export const generateTenantProfilePdf = async (req: Request, res: Response) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    
    try {
        const tenant = await Tenant.findById(req.params.tenantId).populate('propertyId', 'name unit');
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found.' });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const filename = `Tenant-Profile-${tenant.name.replace(/\s/g, '-')}.pdf`;

        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // --- PDF Content ---
        doc.fontSize(20).font('Helvetica-Bold').text(tenant.name, { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`Property: ${(tenant.propertyId as any)?.name || 'N/A'} - Unit: ${tenant.unit || 'N/A'}`, { align: 'center' });
        doc.moveDown(2);

        // Personal Details
        doc.fontSize(14).font('Helvetica-Bold').text('Personal Information', { underline: true });
        doc.moveDown();
        doc.fontSize(10).font('Helvetica-Bold').text('Email: ', { continued: true }).font('Helvetica').text(tenant.email);
        doc.font('Helvetica-Bold').text('Phone: ', { continued: true }).font('Helvetica').text(tenant.phone || 'N/A');
        doc.font('Helvetica-Bold').text("Father's Name: ", { continued: true }).font('Helvetica').text(tenant.fatherName || 'N/A');
        doc.font('Helvetica-Bold').text("Mother's Name: ", { continued: true }).font('Helvetica').text(tenant.motherName || 'N/A');
        doc.font('Helvetica-Bold').text('Permanent Address: ', { continued: true }).font('Helvetica').text(tenant.permanentAddress || 'N/A');
        doc.font('Helvetica-Bold').text('Government ID: ', { continued: true }).font('Helvetica').text(tenant.govtIdNumber || 'N/A');
        doc.moveDown(2);
        
        // Reference Details
        doc.fontSize(14).font('Helvetica-Bold').text('Reference Information', { underline: true });
        doc.moveDown();
        if (tenant.reference && tenant.reference.name) {
            doc.fontSize(10).font('Helvetica-Bold').text('Name: ', { continued: true }).font('Helvetica').text(tenant.reference.name);
            doc.font('Helvetica-Bold').text('Phone: ', { continued: true }).font('Helvetica').text(tenant.reference.phone || 'N/A');
            doc.font('Helvetica-Bold').text('ID Number: ', { continued: true }).font('Helvetica').text(tenant.reference.idNumber || 'N/A');
        } else {
            doc.fontSize(10).font('Helvetica').text('No reference information provided.');
        }

        doc.end();

    } catch (error) {
        console.error("PDF Generation Error:", error);
        res.status(500).send('Error generating PDF file.');
    }
};
