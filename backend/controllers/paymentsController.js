"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = exports.getPayments = void 0;
const Payment_1 = __importDefault(require("../models/Payment"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const getPayments = async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    const payments = await Payment_1.default.find({ organizationId: req.user.organizationId })
        .populate('tenantId', 'name')
        .populate('propertyId', 'name')
        .populate('recordedBy', 'name')
        .sort({ paymentDate: -1 });
    res.status(200).json({ success: true, count: payments.length, data: payments });
};
exports.getPayments = getPayments;
const createPayment = async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    const { tenantId, amount, paymentDate, status, lineItems, paidForMonth } = req.body;
    if (!tenantId || !amount || !paymentDate) {
        res.status(400).json({ success: false, message: 'Tenant, amount, and payment date are required.' });
        return;

    try {
        const tenant = await Tenant_1.default.findById(tenantId);
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Tenant not found in your organization.' });
            return;

        const newPayment = await Payment_1.default.create({
            tenantId,
            amount,
            paymentDate,
            status: status || 'Paid',
            propertyId: tenant.propertyId,
            organizationId: req.user.organizationId,
            recordedBy: req.user._id,
            lineItems: lineItems || [],
            paidForMonth: paidForMonth ? new Date(paidForMonth) : undefined,
        });
        res.status(201).json({ success: true, data: newPayment });

    catch (error) {
        console.error('Error creating payment:', error);
        res.status(500).json({ success: false, message: 'Server Error' });

};
exports.createPayment = createPayment;
//# sourceMappingURL=paymentsController.js.map