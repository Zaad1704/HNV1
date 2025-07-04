"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.getStats = exports.getRentStatus = exports.getFinancialSummary = exports.getExpiringLeases = exports.getLateTenants = exports.getOverviewStats = void 0;
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Expense_1 = __importDefault(require("../models/Expense"));
const dashboardService_1 = __importDefault(require("../services/dashboardService"));
const safeAsync = (fn) => {
    return async (req, res) => {
        try {
            await fn(req, res);
        }
        catch (error) {
            console.error('Dashboard controller error:', error);
            if (!res.headersSent) {
                res.status(200).json({
                    success: true,
                    data: []
                });
            }
        }
    };
};
exports.getOverviewStats = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const organizationId = req.user.organizationId;
    const totalProperties = await Property_1.default.countDocuments({ organizationId }) || 0;
    const activeTenants = await Tenant_1.default.countDocuments({ organizationId, status: 'Active' }) || 0;
    const monthlyRevenue = await Payment_1.default.aggregate([
        { $match: { organizationId, status: { $in: ['Paid', 'completed', 'Completed'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const occupancyRate = totalProperties > 0 ? Math.round((activeTenants / totalProperties) * 100) : 0;
    res.status(200).json({
        success: true,
        data: {
            totalProperties,
            activeTenants,
            monthlyRevenue: monthlyRevenue[0]?.total || 0,
            occupancyRate
        }
    });
});
exports.getLateTenants = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const lateTenants = await Tenant_1.default.find({
        organizationId: req.user.organizationId,
        status: { $in: ['Late', 'Overdue'] }
    }).limit(5) || [];
    res.status(200).json({ success: true, data: lateTenants });
});
exports.getExpiringLeases = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    const expiringLeases = await Tenant_1.default.find({
        organizationId: req.user.organizationId,
        leaseEndDate: { $gte: today, $lte: threeMonthsFromNow },
        status: 'Active'
    }).limit(5) || [];
    res.status(200).json({ success: true, data: expiringLeases });
});
exports.getFinancialSummary = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - (5 - i));
        monthStart.setDate(1);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });
        const revenue = await Payment_1.default.aggregate([
            { $match: { organizationId: req.user.organizationId, paymentDate: { $gte: monthStart, $lte: monthEnd }, status: { $in: ['Paid', 'completed', 'Completed'] } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const expenses = await Expense_1.default.aggregate([
            { $match: { organizationId: req.user.organizationId, date: { $gte: monthStart, $lte: monthEnd } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        monthlyData.push({
            name: monthName,
            Revenue: revenue[0]?.total || 0,
            Expenses: expenses[0]?.total || 0
        });
    }
    res.status(200).json({ success: true, data: monthlyData });
});
exports.getRentStatus = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const activeCount = await Tenant_1.default.countDocuments({ organizationId: req.user.organizationId, status: 'Active' }) || 0;
    const lateCount = await Tenant_1.default.countDocuments({ organizationId: req.user.organizationId, status: 'Late' }) || 0;
    const data = [
        { name: 'Paid / Current', value: activeCount },
        { name: 'Overdue', value: lateCount }
    ];
    res.status(200).json({ success: true, data });
});
exports.getStats = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const stats = await dashboardService_1.default.getDashboardStats(req.user.organizationId);
    res.status(200).json({ success: true, data: stats });
});
exports.getDashboardStats = safeAsync(async (req, res) => {
    if (!req.user?.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const stats = await dashboardService_1.default.getDashboardStats(req.user.organizationId);
    res.status(200).json({ success: true, data: stats });
});
