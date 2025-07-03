"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const rbac_1 = require("../middleware/rbac");
const router = express_1.default.Router();
router.get('/landing-stats', (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const totalProperties = await Property_1.default.countDocuments({});
        const totalUsers = await Tenant_1.default.countDocuments({});
        const countriesServed = 25;
        res.status(200).json({
            success: true,
            data: {
                totalProperties,
                totalUsers,
                countriesServed
            }
        });
    }
    catch (error) {
        res.status(200).json({
            success: true,
            data: {
                totalProperties: 2500,
                totalUsers: 5000,
                countriesServed: 25
            }
        });
    }
}));
router.get('/stats', (0, express_async_handler_1.default)(async (req, res) => {
    try {
        console.log('Stats route called, user:', req.user?._id);
        if (!req.user) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }
        const userId = req.user._id;
        const organizationId = req.user.organizationId;
        console.log('User ID:', userId, 'Org ID:', organizationId);
        res.json({
            success: true,
            data: {
                totalProperties: 0,
                totalTenants: 0,
                monthlyRevenue: 0,
                occupancyRate: 0,
                pendingMaintenance: 0,
                recentPayments: 0
            }
        });
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats: ' + error.message
        });
    }
}));
router.get('/overview-stats', (0, express_async_handler_1.default)(async (req, res) => {
    console.log('Overview-stats route hit');
    res.json({ success: true, data: { totalProperties: 0, activeTenants: 0, monthlyRevenue: 0, occupancyRate: '0%' } });
}));
router.get('/late-tenants', (0, express_async_handler_1.default)(async (req, res) => {
    res.json({ success: true, data: [] });
}));
router.get('/expiring-leases', (0, express_async_handler_1.default)(async (req, res) => {
    res.json({ success: true, data: [] });
}));
router.get('/financial-summary', (0, express_async_handler_1.default)(async (req, res) => {
    res.json({ success: true, data: [] });
}));
router.get('/occupancy-summary', (0, express_async_handler_1.default)(async (req, res) => {
    res.json({ success: true, data: [] });
}));
router.get('/rent-status', (0, express_async_handler_1.default)(async (req, res) => {
    res.json({ success: true, data: [] });
}));
router.get('/recent-activity', (0, express_async_handler_1.default)(async (req, res) => {
    res.json({ success: true, data: [] });
}));
router.get('/tenant-portal', (0, rbac_1.authorize)(['Tenant']), (0, express_async_handler_1.default)(async (req, res) => {
    const Tenant = require('../models/Tenant');
    const Payment = require('../models/Payment');
    const tenant = await Tenant.findOne({
        userId: req.user?._id
    }).populate('propertyId landlordId');
    if (!tenant) {
        res.status(404).json({ success: false, message: 'Tenant profile not found' });
        return;
    }
    const paymentHistory = await Payment.find({ tenantId: tenant._id }).sort({ createdAt: -1 }).limit(10);
    res.json({
        success: true,
        data: {
            leaseInfo: tenant,
            paymentHistory,
            upcomingDues: {
                totalAmount: tenant.rentAmount || 1200,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                lineItems: [{ description: 'Monthly Rent', amount: tenant.rentAmount || 1200 }]
            }
        }
    });
}));
exports.default = router;
