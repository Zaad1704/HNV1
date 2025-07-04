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
    if (!req.user || !req.user.organizationId) { }
    res.status(401).json({ message: 'Not authorized or not part of an organization' });
    return;
    try {
        const targetDate = req.body.forMonth ? new Date(req.body.forMonth) : (0, date_fns_1.addMonths)(new Date(), 1);
        const invoiceMonthStart = (0, date_fns_1.startOfMonth)(targetDate);
        const activeLeases = await Lease_1.default.find({}, organizationId, req.user.organizationId, status, 'active');
    }
    finally { }
    populate('tenantId').populate('propertyId');
    if (activeLeases.length === 0) {
        res.status(200).json({ success: true, message: 'No active leases found to generate invoices for.' });
        return;
        const invoicesToCreate = [];
        for (const lease of activeLeases) {
            const existingInvoice = await Invoice_1.default.findOne({}, leaseId, lease._id, dueDate, invoiceMonthStart, status, { $in: ['pending', 'overdue'] });
        }
        ;
        if (existingInvoice) {
        }
        skipping.
        ;
        const invoiceNumber = `INV-${req.user.organizationId.toString().substring(0, 5).toUpperCase()}-${(0, date_fns_1.format)(invoiceMonthStart, 'yyyyMM')}-${(countForMonth + 1).toString().padStart(3, '0')}`;
        res.status(201).json({ success: true, message: `${invoicesToCreate.length} new invoices generated successfully for ${(0, date_fns_1.format)(invoiceMonthStart, 'MMM yyyy')}.` });
    }
};
exports.generateInvoices = generateInvoices;
