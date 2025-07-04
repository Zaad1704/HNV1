"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentReceipt = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const generatePaymentReceipt = async (req, res) => {
    if (!req.user || !req.user.organizationId) { }
    res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    return;
    try {
        const paymentId = req.params.paymentId;
        const payment = await Payment_1.default.findById(paymentId)
            .populate('tenantId', 'name')
            .populate('propertyId', 'name address')
            .populate('organizationId', 'name')
            .populate('recordedBy', 'name');
        if (!payment || payment.organizationId._id.toString() !== req.user.organizationId.toString()) { }
        res.status(404).json({ success: false, message: 'Payment not found.' });
        return;
        const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
        const filename = `Receipt-${payment._id}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`, doc.font('Helvetica').text(`${payment._id}`
            ? payment.lineItems.map(item => `${item.description} ($${item.amount.toFixed(2)})`)
            : `Rent Payment for ${property.name}, Unit ${property.address?.street || ''}`, doc.text(`$${payment.amount.toFixed(2)}`, doc.text(`$${payment.amount.toFixed(2)}`))));
    }
    finally { }
};
exports.generatePaymentReceipt = generatePaymentReceipt;
