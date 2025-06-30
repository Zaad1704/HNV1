"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const billingController_1 = require("../controllers/billingController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const planController_1 = require("../controllers/planController");
const router = (0, express_1.Router)();
router.get('/', authMiddleware_1.protect, (0, express_async_handler_1.default)(billingController_1.getSubscriptionDetails));
router.post('/create-checkout-session', authMiddleware_1.protect, (0, express_async_handler_1.default)(billingController_1.createCheckoutSession));
router.post('/create-rent-payment', authMiddleware_1.protect, (0, express_async_handler_1.default)(billingController_1.createRentPaymentSession));
router.post('/webhook', (0, express_async_handler_1.default)(billingController_1.handlePaymentWebhook));
router.get('/plans', (0, express_async_handler_1.default)(planController_1.getPlans));
exports.default = router;
