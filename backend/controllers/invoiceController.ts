import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Tenant from '../models/Tenant';
import PDFDocument from 'pdfkit';

// @desc    Generate a PDF rent invoice for a specific tenant
// @route   GET /api/invoices/rent/:tenantId
export const generateRentInvoice = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const tenantId = req.params.tenantId;
        // Populate all necessary details for the invoice
        const tenant = await Tenant.findById(tenantId)
            .populate('propertyId', 'name address')
            .populate({
                path: 'organizationId',
                select: 'name owner',
                populate: { path: 'owner', model: 'User', select: 'name email' }
            });

        if (!tenant || tenant.organizationId._id.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found.' });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        const filename = `Invoice-Rent-${tenant.name.replace(/\s/g, '_')}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // --- PDF Content ---
        // Header
        doc.fontSize(20).font('Helvetica-Bold').text(tenant.organizationId.name, { align: 'left' });
        doc.fontSize(10).font('Helvetica').text(`Issued by: ${(tenant.organizationId as any).owner.name}`, { align: 'left' });
        
        doc.moveDown(3);
        doc.fontSize(18).font('Helvetica-Bold').text('RENT INVOICE', { align: 'center' });
        doc.moveDown(2);

        // Billing Details Section
        const billToY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').text('BILLED TO:', 50, billToY);
        doc.font('Helvetica').text(`${tenant.name}`, 50, billToY + 15);
        doc.text(`${(tenant.propertyId as any).name}, Unit ${tenant.unit}`, 50, billToY + 30);
        doc.text(`${(tenant.propertyId as any).address.street}, ${(tenant.propertyId as any).address.city}`, 50, billToY + 45);

        const detailsTop = billToY;
        const rentAmount = 1200.00; // In a real app, this would come from a 'rent' field on the tenant/lease model
        const invoiceDetails = {
            "Invoice #": `INV-${Date.now().toString().slice(-6)}`,
            "Date Issued": new Date().toLocaleDateString(),
            "Due Date": tenant.leaseEndDate ? new Date(tenant.leaseEndDate).toLocaleDateString() : 'N/A',
        };

        let y = detailsTop;
        for (const [key, value] of Object.entries(invoiceDetails)) {
            doc.font('Helvetica-Bold').text(key, 400, y, { width: 90, align: 'left' });
            doc.font('Helvetica').text(value, 480, y, { align: 'left' });
            y += 15;
        }

        doc.moveDown(5);

        // Invoice Table
        const tableTop = doc.y;
        const tableHeaders = ['Description', 'Amount'];
        doc.font('Helvetica-Bold');
        doc.text(tableHeaders[0], 50, tableTop);
        doc.text(tableHeaders[1], 500, tableTop, { align: 'right' });
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        doc.font('Helvetica');
        const itemY = tableTop + 25;
        doc.text(`Monthly Rent`, 50, itemY);
        doc.text(`$${rentAmount.toFixed(2)}`, 500, itemY, { align: 'right' });
        doc.moveTo(50, itemY + 15).lineTo(550, itemY + 15).stroke();
        
        // Total
        const totalY = itemY + 30;
        doc.font('Helvetica-Bold').fontSize(12).text('Total Due:', 400, totalY);
        doc.text(`$${rentAmount.toFixed(2)}`, 500, totalY, { align: 'right' });

        doc.end();

    } catch (error) {
        console.error("Error generating invoice:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
