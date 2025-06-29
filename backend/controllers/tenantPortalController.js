"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantDashboardData = void 0;
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Lease_1 = __importDefault(require("../models/Lease"));
const Invoice_1 = __importDefault(require("../models/Invoice"));
const date_fns_1 = require("date-fns");
const getTenantDashboardData = async (req, res) => {
    if (!req.user || req.user.role !== 'Tenant') {
        res.status(403).json({ success: false, message: 'Access denied. Not a tenant.' });
        return;
    }
    try {
        const tenantInfo = await Tenant_1.default.findOne({
            email: req.user.email,
            organizationId: req.user.organizationId
        }).populate({
            path: 'propertyId',
            select: 'name address createdBy',
            populate: {
                path: 'createdBy',
                model: 'User',
                select: 'name email'
            }
        });
        if (!tenantInfo) {
            res.status(404).json({ success: false, message: 'Tenant profile not found.' });
            return;
        }
        const activeLease = await Lease_1.default.findOne({ tenantId: tenantInfo._id, status: 'active' });
        const paymentHistory = await Payment_1.default.find({ tenantId: tenantInfo._id })
            .sort({ paymentDate: -1 })
            .limit(10);
        const today = new Date();
        const currentMonthStart = (0, date_fns_1.startOfMonth)(today);
        const outstandingInvoice = await Invoice_1.default.findOne({
            tenantId: tenantInfo._id,
            status: 'pending',
            dueDate: { $gte: currentMonthStart },
        }).sort({ dueDate: 1 });
        const upcomingDues = outstandingInvoice ? {
            invoiceId: outstandingInvoice._id,
            invoiceNumber: outstandingInvoice.invoiceNumber,
            totalAmount: outstandingInvoice.amount,
            lineItems: outstandingInvoice.lineItems,
            dueDate: outstandingInvoice.dueDate.toISOString().split('T')[0],
        } : undefined;
        const dashboardData = {
            leaseInfo: {
                property: {
                    name: tenantInfo.propertyId?.name,
                    street: tenantInfo.propertyId?.address.street,
                    city: tenantInfo.propertyId?.address.city,
                },
                unit: tenantInfo.unit,
                status: tenantInfo.status,
                landlord: {
                    name: tenantInfo.propertyId?.createdBy.name,
                    email: tenantInfo.propertyId?.createdBy.email,
                },
                rentAmount: tenantInfo.rentAmount,
                leaseEndDate: tenantInfo.leaseEndDate,
            },
            paymentHistory,
            upcomingDues,
        };
        res.status(200).json({ success: true, data: dashboardData });
    }
    catch (error) {
        console.error('Error fetching tenant dashboard data:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getTenantDashboardData = getTenantDashboardData;
//# sourceMappingURL=tenantPortalController.js.map