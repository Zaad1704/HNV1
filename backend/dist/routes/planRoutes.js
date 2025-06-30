"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const planController_1 = require("../controllers/planController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const rbac_1 = require("../middleware/rbac");
const Plan_1 = __importDefault(require("../models/Plan"));
const router = (0, express_1.Router)();
router.get('/public', (0, express_async_handler_1.default)(async (req, res) => {
    try {
        const plans = await Plan_1.default.find({ isPublic: true }).sort({ price: 1 });
        res.status(200).json({ success: true, data: plans });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
}));
router.route('/')
    .get((0, express_async_handler_1.default)(planController_1.getPlans))
    .post(authMiddleware_1.protect, (0, rbac_1.authorize)(['Super Admin']), (0, express_async_handler_1.default)(planController_1.createPlan));
router.route('/:id')
    .put(authMiddleware_1.protect, (0, rbac_1.authorize)(['Super Admin']), (0, express_async_handler_1.default)(planController_1.updatePlan))
    .delete(authMiddleware_1.protect, (0, rbac_1.authorize)(['Super Admin']), (0, express_async_handler_1.default)(planController_1.deletePlan));
exports.default = router;
