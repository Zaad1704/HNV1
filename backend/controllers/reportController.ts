import { Request, Response } from 'express'; // FIX: Import Request
// FIX: AuthenticatedRequest is no longer needed.
import Tenant from '../models/Tenant';
import PDFDocument from 'pdfkit';

export const generateMonthlyCollectionSheet = async (req: Request, res: Response) => { // FIX: Use Request
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

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
