"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/routes/billingRoutes.ts
const express_1 = require("express");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const billingController_1 = require("../controllers/billingController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const planController_1 = require("../controllers/planController");
const router = (0, express_1.Router)();
// Get subscription details for the user's organization
router.get('/', authMiddleware_1.protect, (0, express_async_handler_1.default)(billingController_1.getSubscriptionDetails));
// Create a checkout session for a subscription plan
router.post('/create-checkout-session', authMiddleware_1.protect, (0, express_async_handler_1.default)(billingController_1.createCheckoutSession));
// Create a checkout session for a one-time rent payment
router.post('/create-rent-payment', authMiddleware_1.protect, (0, express_async_handler_1.default)(billingController_1.createRentPaymentSession));
// Handle incoming webhooks from the payment provider
router.post('/webhook', (0, express_async_handler_1.default)(billingController_1.handlePaymentWebhook));
// CORRECTED: Route to get public plans, imported as getSubscriptionPlans
router.get('/plans', (0, express_async_handler_1.default)(planController_1.getPlans));
exports.default = router;
//# sourceMappingURL=billingRoutes.js.map