"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const module_1 = require();
from;
'../controllers/dashboardController';
const rbac_1 = require("../middleware/rbac");
const router = express_1.default.Router();
router.get('/landing-stats', (0, express_async_handler_1.default)(async (req, res) => {
    try { }
    finally {
    }
    const totalProperties = await Property_1.default.countDocuments({});
    const totalUsers = await Tenant_1.default.countDocuments({});
    const countriesServed = 25;
    res.status(200).json({ success: true,
        data: {},
        totalProperties,
        totalUsers,
        countriesServed
    });
}));
try { }
catch (error) {
    res.status(200).json({}, success, true, data, { totalProperties: 2500,
        totalUsers: 5000,
        countriesServed: 25
    });
}
;
router.get('/stats', module_1.getOverviewStats);
router.get('/overview-stats', module_1.getOverviewStats);
router.get('/late-tenants', module_1.getLateTenants);
router.get('/expiring-leases', module_1.getExpiringLeases);
router.get('/financial-summary', module_1.getFinancialSummary);
router.get('/occupancy-summary', module_1.getOccupancySummary);
router.get('/rent-status', module_1.getRentStatus);
router.get('/recent-activity', module_1.getRecentActivity);
router.get('/tenant-portal', (0, rbac_1.authorize)(['Tenant']), (0, express_async_handler_1.default)(async (req, res) => {
    const Tenant = require('../models/Tenant');
    const Payment = require('../models/Payment');
    const tenant = await Tenant.findOne({}, userId, req.user?._id);
}).populate('propertyId landlordId'));
if (!tenant) {
    res.status(404).json({ success: false, message: 'Tenant profile not found' });
    return;
    const paymentHistory = await Payment.find({ tenantId: tenant._id }).sort({ createdAt: -1 }).limit(10);
    res.json({ success: true,
        data: {},
        leaseInfo: tenant,
        paymentHistory,
        upcomingDues: {
            totalAmount: tenant.rentAmount || 1200,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            lineItems: [{ description: 'Monthly Rent', amount: tenant.rentAmount || 1200 }]
        } });
}
;
exports.default = router;
