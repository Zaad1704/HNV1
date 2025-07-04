"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.getRentStatus = exports.getFinancialSummary = exports.getExpiringLeases = exports.getLateTenants = exports.getOverviewStats = void 0;
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Expense_1 = __importDefault(require("../models/Expense"));
const dashboardService_1 = __importDefault(require("../services/dashboardService"));
const getOverviewStats = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const organizationId = req.user.organizationId;
        const totalProperties = await Property_1.default.countDocuments({ organizationId });
        const activeTenants = await Tenant_1.default.countDocuments({ organizationId, status: 'Active' });
        const monthlyRevenue = await Payment_1.default.aggregate([
            { $match: { organizationId, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const occupancyRate = totalProperties > 0 ? ((activeTenants / totalProperties) * 100).toFixed(2) + '%' : '0%';
        res.status(200).json({
            success: true,
            data: {
                totalProperties,
                activeTenants,
                monthlyRevenue: monthlyRevenue[0]?.total || 0,
                occupancyRate
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getOverviewStats = getOverviewStats;
const getLateTenants = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const lateTenants = await Tenant_1.default.find({
            organizationId: req.user.organizationId,
            status: { $in: ['Late', 'Overdue'] }
        }).limit(5);
        res.status(200).json({ success: true, data: lateTenants });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getLateTenants = getLateTenants;
const getExpiringLeases = async (req, res) => {
    try {
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
        }).limit(5);
        res.status(200).json({ success: true, data: expiringLeases });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getExpiringLeases = getExpiringLeases;
const getFinancialSummary = async (req, res) => {
    try {
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
                { $match: { organizationId: req.user.organizationId, paymentDate: { $gte: monthStart, $lte: monthEnd }, status: 'completed' } },
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
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getFinancialSummary = getFinancialSummary;
const getRentStatus = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const activeCount = await Tenant_1.default.countDocuments({ organizationId: req.user.organizationId, status: 'Active' });
        const lateCount = await Tenant_1.default.countDocuments({ organizationId: req.user.organizationId, status: 'Late' });
        const data = [
            { name: 'Paid / Current', value: activeCount },
            { name: 'Overdue', value: lateCount }
        ];
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getRentStatus = getRentStatus;
const getStats = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const stats = await dashboardService_1.default.getDashboardStats(req.user.organizationId);
        res.status(200).json({ success: true, data: stats });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getStats = getStats;
