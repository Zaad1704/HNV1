"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Property_1 = __importDefault(require("../models/Property"));
const Tenant_1 = __importDefault(require("../models/Tenant"));
const dashboardController_1 = require("../controllers/dashboardController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const router = express_1.default.Router();
// Public route for landing stats
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
// Protected routes
router.use(authMiddleware_1.protect, (0, rbac_1.authorize)(['Super Admin', 'Super Moderator', 'Landlord', 'Agent']));
router.get('/overview-stats', (0, express_async_handler_1.default)(dashboardController_1.getOverviewStats));
router.get('/late-tenants', (0, express_async_handler_1.default)(dashboardController_1.getLateTenants));
router.get('/expiring-leases', (0, express_async_handler_1.default)(dashboardController_1.getExpiringLeases));
router.get('/financial-summary', (0, express_async_handler_1.default)(dashboardController_1.getFinancialSummary));
router.get('/occupancy-summary', (0, express_async_handler_1.default)(dashboardController_1.getOccupancySummary));
// --- NEW ROUTES FOR OVERVIEW WIDGETS ---
router.get('/rent-status', (0, express_async_handler_1.default)(dashboardController_1.getRentStatus));
router.get('/recent-activity', (0, express_async_handler_1.default)(dashboardController_1.getRecentActivity));
exports.default = router;
//# sourceMappingURL=dashboardRoutes.js.map