"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionStatus = exports.cancelSubscription = exports.reactivateSubscription = exports.subscribeToPlan = exports.getBillingHistory = exports.createCheckoutSession = exports.getSubscriptionDetails = void 0;
const Plan_1 = __importDefault(require("../models/Plan"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const Organization_1 = __importDefault(require("../models/Organization"));
const subscriptionService_1 = __importDefault(require("../services/subscriptionService"));
const getSubscriptionDetails = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const subscription = await Subscription_1.default.findOne({
            organizationId: req.user.organizationId
        }).populate('planId').lean().exec();
        if (!subscription) {
            const org = await Organization_1.default.findById(req.user.organizationId).lean().exec();
            if (org?.subscription?.isLifetime) {
                return res.status(200).json({
                    success: true,
                    data: {
                        status: 'active',
                        isLifetime: true,
                        planId: org.subscription.planId
                    }
                });
            }
            return res.status(200).json({ success: true, data: null });
        }
        res.status(200).json({ success: true, data: subscription });
    }
    catch (error) {
        console.error('Billing subscription error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subscription details',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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
        const subscription = await Subscription_1.default.findOne({
            organizationId: req.user.organizationId
        }).populate('planId').lean().exec();
        const billingHistory = subscription ? [
            {
                _id: '1',
                date: subscription.createdAt,
                amount: subscription.planId?.price || 0,
                status: 'paid',
                description: `${subscription.planId?.name || 'Plan'} Subscription`
            }
        ] : [];
        res.status(200).json({ success: true, data: billingHistory });
    }
    catch (error) {
        console.error('Billing history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch billing history',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.getBillingHistory = getBillingHistory;
const subscribeToPlan = async (req, res) => {
    try {
        const { planId, isTrial = false } = req.body;
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        let subscription;
        if (isTrial) {
            subscription = await subscriptionService_1.default.createTrialSubscription(req.user.organizationId, planId);
        }
        else {
            subscription = await subscriptionService_1.default.activateSubscription(req.user.organizationId, planId);
        }
        res.json({ success: true, data: subscription });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.subscribeToPlan = subscribeToPlan;
const reactivateSubscription = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const subscription = await subscriptionService_1.default.reactivateSubscription(req.user.organizationId);
        res.json({ success: true, data: subscription });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.reactivateSubscription = reactivateSubscription;
const cancelSubscription = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const subscription = await subscriptionService_1.default.cancelSubscription(req.user.organizationId);
        res.json({ success: true, data: subscription });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.cancelSubscription = cancelSubscription;
const getSubscriptionStatus = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const status = await subscriptionService_1.default.getSubscriptionStatus(req.user.organizationId);
        res.json({ success: true, data: status });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
};
exports.getSubscriptionStatus = getSubscriptionStatus;
