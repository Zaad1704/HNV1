"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentReceipt = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const generatePaymentReceipt = async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const paymentId = req.params.paymentId;
        const payment = await Payment_1.default.findById(paymentId)
            .populate('tenantId', 'name')
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name')
            .populate('recordedBy', 'name');
        if (!payment || payment.organizationId._id.toString() !== req.user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Payment not found.' });
            return;
        }
        const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
        const filename = `Receipt-${payment._id}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');
        doc.pipe(res);
        doc.fontSize(20).font('Helvetica-Bold').text(payment.organizationId.name, { align: 'center' });
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
        doc.font('Helvetica').text(payment.tenantId.name);
        doc.moveDown();
        doc.font('Helvetica-Bold').text('RECEIVED BY:');
        doc.font('Helvetica').text(payment.recordedBy.name);
        doc.moveDown(2);
        const tableTop = doc.y;
        doc.font('Helvetica-Bold');
        doc.text('Description', 50, tableTop);
        doc.text('Amount', 500, tableTop, { align: 'right' });
        doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
        doc.font('Helvetica');
        const itemY = tableTop + 25;
        const property = payment.propertyId;
        const description = payment.lineItems && payment.lineItems.length > 0
            ? payment.lineItems.map(item => `${item.description} ($${item.amount.toFixed(2)})`).join(', ')
            : `Rent Payment for ${property.name}, Unit ${property.address?.street || ''}`;
        doc.text(description, 50, itemY);
        doc.text(`$${payment.amount.toFixed(2)}`, 500, itemY, { align: 'right' });
        const totalY = itemY + 40;
        doc.font('Helvetica-Bold').fontSize(14).text('TOTAL PAID:', 350, totalY);
        doc.text(`$${payment.amount.toFixed(2)}`, 450, totalY, { width: 100, align: 'right' });
        doc.moveDown(5);
        doc.font('Helvetica-Oblique').fontSize(10).text('Thank you for your payment!', { align: 'center' });
        doc.end();
    }
    catch (error) {
        console.error("Error generating receipt:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.generatePaymentReceipt = generatePaymentReceipt;
//# sourceMappingURL=receiptController.js.map