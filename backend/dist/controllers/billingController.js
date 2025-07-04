"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBillingHistory = exports.createCheckoutSession = exports.getSubscriptionDetails = void 0;
const Plan_1 = __importDefault(require("../models/Plan"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const getSubscriptionDetails = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const subscription = await Subscription_1.default.findOne({
            organizationId: req.user.organizationId
        }).populate('planId');
        if (!subscription) {
            return res.status(200).json({ success: true, data: null });
        }
        res.status(200).json({ success: true, data: subscription });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getSubscriptionDetails = getSubscriptionDetails;
const createCheckoutSession = async (req, res) => {
    try {
        const { planId } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        const plan = await Plan_1.default.findById(planId);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        const sessionId = `mock_session_${Date.now()}`;
        const redirectUrl = `${process.env.FRONTEND_URL}/payment-success?session_id=${sessionId}`;
        res.json({
            success: true,
            checkoutUrl: redirectUrl,
            sessionId
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createCheckoutSession = createCheckoutSession;
const getBillingHistory = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const billingHistory = [];
        res.status(200).json({ success: true, data: billingHistory });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getBillingHistory = getBillingHistory;
