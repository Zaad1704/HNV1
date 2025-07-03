"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const date_fns_1 = require("date-fns");
const router = (0, express_1.Router)();
router.get('/monthly-collection', (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user?.organizationId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
    }
    const { month, year } = req.query;
    const targetDate = new Date(Number(year), Number(month) - 1, 1);
    const monthStart = (0, date_fns_1.startOfMonth)(targetDate);
    const monthEnd = (0, date_fns_1.endOfMonth)(targetDate);
    const tenants = await Tenant_1.default.find({
        organizationId: req.user.organizationId,
        status: 'Active'
    }).populate('propertyId', 'name');
    const collectionData = await Promise.all(tenants.map(async (tenant) => {
        const payment = await Payment_1.default.findOne({
            tenantId: tenant._id,
            paymentDate: { $gte: monthStart, $lte: monthEnd },
            status: 'Paid'
        });
        const overduePayments = await Payment_1.default.find({
            tenantId: tenant._id,
            paymentDate: { $lt: monthStart },
            status: { $ne: 'Paid' }
        });
        return {
            _id: tenant._id,
            tenantName: tenant.name,
            unitNo: tenant.unit,
            propertyName: tenant.propertyId?.name || 'N/A',
            rentAmount: tenant.rentAmount || 0,
            rentStartMonth: `${month}/${year}`,
            overdueMonths: overduePayments.map(p => new Date(p.paymentDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
            isCollected: !!payment
        };
    }));
    res.json({ success: true, data: collectionData });
}));
exports.default = router;
