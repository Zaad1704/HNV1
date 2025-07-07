"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const dashboardController_1 = require("../controllers/dashboardController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.protect);
router.get('/overview', dashboardController_1.getOverviewStats);
router.get('/overview-stats', dashboardController_1.getOverviewStats);
router.get('/late-tenants', dashboardController_1.getLateTenants);
router.get('/expiring-leases', dashboardController_1.getExpiringLeases);
router.get('/financial-summary', dashboardController_1.getFinancialSummary);
router.get('/rent-status', dashboardController_1.getRentStatus);
router.get('/stats', dashboardController_1.getStats);
router.get('/dashboard-stats', dashboardController_1.getDashboardStats);
router.get('/cashflow', async (req, res) => {
    res.json({
        success: true,
        data: {
            income: 0,
            expenses: 0,
            netFlow: 0,
            monthlyData: []
        }
    });
});
router.get('/recent-activity', async (req, res) => {
    res.json({
        success: true,
        data: [
            {
                id: '1',
                type: 'payment',
                title: 'Payment Received',
                description: 'Monthly rent payment from John Doe',
                timestamp: new Date().toISOString(),
                amount: 1200
            }
        ]
    });
});
exports.default = router;
