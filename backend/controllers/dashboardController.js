"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentActivity = exports.getRentStatus = exports.getOccupancySummary = exports.getFinancialSummary = exports.getExpiringLeases = exports.getLateTenants = exports.getOverviewStats = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Payment_1 = __importDefault(require("../models/Payment"));
const Expense_1 = __importDefault(require("../models/Expense"));
const AuditLog_1 = __importDefault(require("../models/AuditLog"));
const date_fns_1 = require("date-fns");
exports.getOverviewStats = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        throw new Error('User not authorized');

    const organizationId = req.user.organizationId;
    const totalProperties = await Property_1.default.countDocuments({ organizationId });
    const activeTenants = await Tenant_1.default.countDocuments({ organizationId, status: 'Active' });
    const currentMonthStart = (0, date_fns_1.startOfMonth)(new Date());
    const currentMonthEnd = (0, date_fns_1.endOfMonth)(new Date());
    const monthlyRevenue = await Payment_1.default.aggregate([
        { $match: { organizationId, paymentDate: { $gte: currentMonthStart, $lte: currentMonthEnd }, status: 'Paid' } },
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

    });
});
exports.getLateTenants = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');

    const { organizationId } = req.user;
    const lateTenants = await Tenant_1.default.find({ organizationId, status: 'Late' })
        .populate('propertyId', 'name unit')
        .select('name email unit propertyId')
        .limit(5);
    res.status(200).json({ success: true, data: lateTenants });
});
exports.getExpiringLeases = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');

    const { organizationId } = req.user;
    const today = new Date();
    const threeMonthsFromNow = (0, date_fns_1.addMonths)(today, 3);
    const expiringLeases = await Tenant_1.default.find({
        organizationId,
        leaseEndDate: { $gte: today, $lte: threeMonthsFromNow },
        status: 'Active'
    })
        .populate('propertyId', 'name unit')
        .select('name email unit leaseEndDate propertyId')
        .sort({ leaseEndDate: 1 })
        .limit(5);
    res.status(200).json({ success: true, data: expiringLeases });
});
exports.getFinancialSummary = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');

    const { organizationId } = req.user;
    const sixMonthsAgo = (0, date_fns_1.subMonths)(new Date(), 5);
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
        const monthStart = (0, date_fns_1.startOfMonth)((0, date_fns_1.addMonths)(sixMonthsAgo, i));
        const monthEnd = (0, date_fns_1.endOfMonth)(monthStart);
        const monthName = (0, date_fns_1.format)(monthStart, 'MMM');
        const revenueResult = await Payment_1.default.aggregate([
            { $match: {
                    organizationId,
                    paymentDate: { $gte: monthStart, $lte: monthEnd },
                    status: 'Paid'
                } },
            { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
        ]);
        const expensesResult = await Expense_1.default.aggregate([
            { $match: {
                    organizationId,
                    date: { $gte: monthStart, $lte: monthEnd }
                } },
            { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
        ]);
        monthlyData.push({
            name: monthName,
            Revenue: revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0,
            Expenses: expensesResult.length > 0 ? expensesResult[0].totalExpenses : 0,
        });

    res.status(200).json({ success: true, data: monthlyData });
});
exports.getOccupancySummary = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');

    const { organizationId } = req.user;
    const sixMonthsAgo = (0, date_fns_1.subMonths)(new Date(), 5);
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
        const monthStart = (0, date_fns_1.startOfMonth)((0, date_fns_1.addMonths)(sixMonthsAgo, i));
        const monthEnd = (0, date_fns_1.endOfMonth)(monthStart);
        const monthName = (0, date_fns_1.format)(monthStart, 'MMM');
        const newTenantsCount = await Tenant_1.default.countDocuments({
            organizationId,
            createdAt: { $gte: monthStart, $lte: monthEnd }
        });
        monthlyData.push({
            name: monthName,
            'New Tenants': newTenantsCount,
        });

    res.status(200).json({ success: true, data: monthlyData });
});
exports.getRentStatus = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');

    const { organizationId } = req.user;
    const activeCount = await Tenant_1.default.countDocuments({ organizationId, status: 'Active' });
    const lateCount = await Tenant_1.default.countDocuments({ organizationId, status: 'Late' });
    const data = [
        { name: 'Paid / Current', value: activeCount },
        { name: 'Overdue', value: lateCount },
    ];
    res.status(200).json({ success: true, data });
});
exports.getRecentActivity = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user?.organizationId) {
        throw new Error('User or organization not found');

    const { organizationId } = req.user;
    const activities = await AuditLog_1.default.find({ organizationId })
        .populate('user', 'name')
        .sort({ timestamp: -1 })
        .limit(5);
    res.status(200).json({ success: true, data: activities });
});
//# sourceMappingURL=dashboardController.js.map