"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePaymentWebhook = exports.createRentPaymentSession = exports.createCheckoutSession = exports.getSubscriptionDetails = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const Plan_1 = __importDefault(require("../models/Plan"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
// --- SOLUTION: Added 'next: NextFunction' to the function signature ---
exports.getSubscriptionDetails = (0, express_async_handler_1.default)(async (req, res, next) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authenticated or associated with an organization.' });
        return;
    }
    const subscription = await Subscription_1.default.findOne({ organizationId: req.user.organizationId }).populate('planId');
    if (!subscription) {
        res.status(200).json({ success: true, data: null });
        return;
    }
    res.status(200).json({ success: true, data: subscription });
});
exports.createCheckoutSession = (0, express_async_handler_1.default)(async (req, res, next) => {
    // ... function logic remains the same
    const { planId } = req.body;
    const user = req.user;
    if (!user) {
        res.status(401).json({ success: false, message: 'User not authenticated.' });
        return;
    }
    const plan = await Plan_1.default.findById(planId);
    if (!plan) {
        res.status(404).json({ success: false, message: 'Plan not found.' });
        return;
    }
    const redirectUrl = `https://hnv-1-frontend.onrender.com/payment-success?session_id=mock_session_${new Date().getTime()}`;
    res.status(200).json({ success: true, redirectUrl: redirectUrl });
});
exports.createRentPaymentSession = (0, express_async_handler_1.default)(async (req, res, next) => {
    // ... function logic remains the same
    const user = req.user;
    if (!user) {
        res.status(401).json({ success: false, message: 'User not authenticated.' });
        return;
    }
    const { invoiceId } = req.body;
    if (!invoiceId) {
        res.status(400).json({ success: false, message: 'Invoice ID is required for rent payment.' });
        return;
    }
    const redirectUrl = `${process.env.FRONTEND_URL}/payment-success?invoiceId=${invoiceId}&transactionId=mock_txn_id`;
    res.status(200).json({ success: true, redirectUrl: redirectUrl });
});
exports.handlePaymentWebhook = (0, express_async_handler_1.default)(async (req, res, next) => {

    res.status(200).send('Webhook processed');
});
//# sourceMappingURL=billingController.js.map