"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateInvoices = void 0;
const Invoice_1 = __importDefault(require("../models/Invoice"));
const Lease_1 = __importDefault(require("../models/Lease"));
const date_fns_1 = require("date-fns");
const generateInvoices = async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const targetDate = req.body.forMonth ? new Date(req.body.forMonth) : (0, date_fns_1.addMonths)(new Date(), 1);
        const invoiceMonthStart = (0, date_fns_1.startOfMonth)(targetDate);
        const activeLeases = await Lease_1.default.find({
            organizationId: req.user.organizationId,
            status: 'active'
        }).populate('tenantId').populate('propertyId');
        if (activeLeases.length === 0) {
            res.status(200).json({ success: true, message: 'No active leases found to generate invoices for.' });
            return;
        }
        const invoicesToCreate = [];
        for (const lease of activeLeases) {
            const existingInvoice = await Invoice_1.default.findOne({
                leaseId: lease._id,
                dueDate: invoiceMonthStart,
                status: { $in: ['pending', 'overdue'] }
            });
            if (existingInvoice) {
                console.log(`Invoice already exists for lease ${lease._id} for ${(0, date_fns_1.format)(invoiceMonthStart, 'MMM yyyy')}, skipping.`);
                continue;
            }
            const countForMonth = await Invoice_1.default.countDocuments({
                organizationId: req.user.organizationId,
                dueDate: { $gte: (0, date_fns_1.startOfMonth)(invoiceMonthStart), $lte: (0, date_fns_1.endOfMonth)(invoiceMonthStart) },
            });
            const invoiceNumber = `INV-${req.user.organizationId.toString().substring(0, 5).toUpperCase()}-${(0, date_fns_1.format)(invoiceMonthStart, 'yyyyMM')}-${(countForMonth + 1).toString().padStart(3, '0')}`;
            const lineItems = [
                { description: 'Monthly Rent', amount: lease.rentAmount },
            ];
            const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);
            invoicesToCreate.push({
                tenantId: lease.tenantId,
                propertyId: lease.propertyId,
                organizationId: lease.organizationId,
                leaseId: lease._id,
                invoiceNumber: invoiceNumber,
                amount: totalAmount,
                dueDate: invoiceMonthStart,
                status: 'pending',
                lineItems: lineItems,
            });
        }
        if (invoicesToCreate.length > 0) {
            await Invoice_1.default.insertMany(invoicesToCreate);
            res.status(201).json({ success: true, message: `${invoicesToCreate.length} new invoices generated successfully for ${(0, date_fns_1.format)(invoiceMonthStart, 'MMM yyyy')}.` });
        }
        else {
            res.status(200).json({ success: true, message: 'No new invoices needed for generation this month.' });
        }
    }
    catch (error) {
        console.error('Invoice generation failed:', error);
        res.status(500).json({ success: false, message: 'Server Error during invoice generation.' });
    }
};
exports.generateInvoices = generateInvoices;
