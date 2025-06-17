// backend/controllers/invoiceController.ts (or relevant file)

import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Tenant, { ITenant } from '../models/Tenant'; // Assuming Tenant model exports ITenant
import { IProperty } from '../models/Property';     // Assuming you have these interfaces
import { IOrganization } from '../models/Organization';
import { IUser } from '../models/User';
import { ILease } from '../models/Lease';
import PDFDocument from 'pdfkit';
import { format } from 'date-fns'; // Using date-fns for consistent date formatting

// --- Define Interfaces for Populated Documents ---
// This improves type safety and autocompletion significantly.
interface IPopulatedTenant extends ITenant {
    propertyId: IProperty;
    leaseId: ILease; // Assuming tenant is linked to a lease with rent details
    organizationId: IOrganization & {
        owner: IUser;
    };
}

/**
 * @desc    Generate a PDF rent invoice for a specific tenant
 * @route   GET /api/invoices/rent/:tenantId
 * @access  Private
 */
export const generateRentInvoice = async (req: AuthenticatedRequest, res: Response) => {
    // Ensure user is authenticated
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const tenantId = req.params.tenantId;

        // 1. Fetch tenant and populate all necessary details.
        const tenant = await Tenant.findById(tenantId)
            .populate<{ propertyId: IProperty }>('propertyId', 'name address')
            .populate<{ leaseId: ILease }>('leaseId', 'rentAmount') // Populating lease to get rent
            .populate({
                path: 'organizationId',
                select: 'name owner',
                populate: { path: 'owner', model: 'User', select: 'name email' }
            })
            .exec() as IPopulatedTenant;

        // 2. Authorize and validate data.
        if (!tenant || tenant.organizationId._id.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found.' });
        }
        
        if (!tenant.propertyId || !tenant.organizationId?.owner || !tenant.leaseId) {
             return res.status(404).json({ success: false, message: 'Missing property, owner, or lease information.' });
        }

        // 3. Setup PDF document and response headers.
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        
        // FIX: Corrected the template literal for the filename
        const filename = `Invoice-Rent-${tenant.name.replace(/\s/g, '_')}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // --- PDF Content Generation ---

        // Header
        doc.fontSize(20).font('Helvetica-Bold').text(tenant.organizationId.name, { align: 'left' });
        doc.fontSize(10).font('Helvetica').text(`Issued by: ${tenant.organizationId.owner.name}`, { align: 'left' });
        
        doc.moveDown(3);
        doc.fontSize(18).font('Helvetica-Bold').text('RENT INVOICE', { align: 'center' });
        doc.moveDown(2);

        // Billing Details and Invoice Info
        const billToY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').text('BILLED TO:', 50, billToY);
        doc.font('Helvetica').text(`${tenant.name}`, 50, billToY + 15);
        doc.text(`${tenant.propertyId.name}, Unit ${tenant.unit || 'N/A'}`, 50, billToY + 30);
        doc.text(`${tenant.propertyId.address.street}, ${tenant.propertyId.address.city}`, 50, billToY + 45);

        const rentAmount = tenant.leaseId.rentAmount; 
        const invoiceDetails = {
            "Invoice #": `INV-${Date.now().toString().slice(-6)}`,
            "Date Issued": format(new Date(), 'MMM dd, yyyy'),
            "Due Date": tenant.leaseEndDate ? format(new Date(tenant.leaseEndDate), 'MMM dd, yyyy') : 'N/A',
        };

        let y = billToY;
        for (const [key, value] of Object.entries(invoiceDetails)) {
            doc.font('Helvetica-Bold').text(key, 400, y, { width: 90, align: 'left' });
            doc.font('Helvetica').text(value, 480, y, { align: 'left' });
            y += 15;
        }

        doc.moveDown(5);

        // --- COMPLETION: Added the rest of the invoice table and total ---
        
        // Invoice Table Header
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Description', 50, tableTop);
        doc.text('Amount', 500, tableTop, { align: 'right' });
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        // Invoice Table Row
        const itemY = tableTop + 25;
        doc.font('Helvetica');
        doc.text(`Monthly Rent for ${tenant.propertyId.name}`, 50, itemY);
        doc.text(`$${rentAmount.toFixed(2)}`, 0, itemY, { align: 'right' });
        doc.moveTo(50, itemY + 15).lineTo(550, itemY + 15).stroke();
        
        // Total
        const totalY = itemY + 30;
        doc.font('Helvetica-Bold').fontSize(12).text('Total Due:', 400, totalY);
        doc.text(`$${rentAmount.toFixed(2)}`, 0, totalY, { align: 'right' });

        // Finalize the PDF
        doc.end();

    // --- FIX: Added the missing catch block ---
    } catch (error) {
        console.error("Error generating invoice:", error);
        // Avoid sending another response if headers are already sent
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Server Error while generating invoice." });
        }
    }
};
