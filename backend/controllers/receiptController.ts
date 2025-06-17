import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import Payment from '../models/Payment';
import PDFDocument from 'pdfkit';

// @desc    Generate a PDF receipt for a single payment
// @route   GET /api/receipts/payment/:paymentId
export const generatePaymentReceipt = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    try {
        const paymentId = req.params.paymentId;
        const payment = await Payment.findById(paymentId)
            .populate('tenantId', 'name')
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name')
            .populate('recordedBy', 'name');

        if (!payment || payment.organizationId._id.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Payment not found.' });
        }

        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        const filename = `Receipt-${payment._id}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res);

        // --- PDF Content ---
        doc.fontSize(20).font('Helvetica-Bold').text((payment.organizationId as any).name, { align: 'center' });
        doc.moveDown();
        doc.fontSize(16).font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
        doc.moveDown(2);

        const detailsTop = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').text('Receipt #:', 50, detailsTop);
        doc.font('Helvetica').text(`${payment._id}`, 120, detailsTop);

        doc.font('Helvetica-Bold').text('Payment Date:', 50, detailsTop + 20);
        doc.font('Helvetica').text(new Date(payment.paymentDate).toLocaleDateString(), 120, detailsTop + 20);

        doc.moveDown(3);

        doc.font('Helvetica-Bold').text('RECEIVED FROM:');
        doc.font('Helvetica').text((payment.tenantId as any).name);
        doc.moveDown();

        doc.font('Helvetica-Bold').text('RECEIVED BY:');
        doc.font('Helvetica').text((payment.recordedBy as any).name);
        doc.moveDown(2);
        
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Description', 50, tableTop);
        doc.text('Amount', 500, tableTop, { align: 'right' });
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

        doc.font('Helvetica');
        const itemY = tableTop + 25;
        const property = payment.propertyId as any;
        doc.text(`Rent Payment for ${property.name}, Unit ${property.address.street}`, 50, itemY);
        doc.text(`$${payment.amount.toFixed(2)}`, 500, itemY, { align: 'right' });

        const totalY = itemY + 40;
        doc.font('Helvetica-Bold').fontSize(14).text('TOTAL PAID:', 350, totalY);
        doc.text(`$${payment.amount.toFixed(2)}`, 450, totalY, { width: 100, align: 'right' });

        doc.moveDown(5);
        doc.font('Helvetica-Oblique').fontSize(10).text('Thank you for your payment!', { align: 'center' });

        doc.end();

    } catch (error) {
        console.error("Error generating receipt:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
