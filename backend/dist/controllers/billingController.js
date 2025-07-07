"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelSubscription = exports.changePlan = exports.updatePaymentMethod = exports.getBillingInfo = void 0;
const Subscription_1 = __importDefault(require("../models/Subscription"));
const Plan_1 = __importDefault(require("../models/Plan"));
const getBillingInfo = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const subscription = await Subscription_1.default.findOne({
            organizationId: req.user.organizationId
        }).populate('planId');
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'No subscription found'
            });
        }
        const billingInfo = {
            subscription: {
                status: subscription.status,
                currentPeriodEndsAt: subscription.currentPeriodEndsAt,
                nextBillingDate: subscription.nextBillingDate,
                amount: subscription.amount,
                currency: subscription.currency,
                billingCycle: subscription.billingCycle,
                isLifetime: subscription.isLifetime,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
            },
            plan: subscription.planId,
            paymentMethod: subscription.paymentMethod || 'Not set',
            lastPaymentDate: subscription.lastPaymentDate,
            failedPaymentAttempts: subscription.failedPaymentAttempts
        };
        res.json({ success: true, data: billingInfo });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getBillingInfo = getBillingInfo;
const updatePaymentMethod = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { paymentMethod } = req.body;
        if (!paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Payment method is required'
            });
        }
        const subscription = await Subscription_1.default.findOneAndUpdate({ organizationId: req.user.organizationId }, { paymentMethod }, { new: true });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        res.json({
            success: true,
            message: 'Payment method updated successfully',
            data: { paymentMethod: subscription.paymentMethod }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updatePaymentMethod = updatePaymentMethod;
const changePlan = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { planId } = req.body;
        if (!planId) {
            return res.status(400).json({
                success: false,
                message: 'Plan ID is required'
            });
        }
        const plan = await Plan_1.default.findById(planId);
        if (!plan) {
            return res.status(404).json({
                success: false,
                message: 'Plan not found'
            });
        }
        const subscription = await Subscription_1.default.findOne({
            organizationId: req.user.organizationId
        });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        subscription.planId = planId;
        subscription.amount = plan.price;
        subscription.billingCycle = plan.billingCycle === 'one-time' ? 'monthly' : plan.billingCycle;
        subscription.status = 'active';
        subscription.lastPaymentDate = new Date();
        subscription.failedPaymentAttempts = 0;
        const now = new Date();
        subscription.currentPeriodStartsAt = now;
        const nextBilling = new Date();
        const nextPeriodEnd = new Date();
        if (plan.billingCycle === 'monthly') {
            nextBilling.setMonth(nextBilling.getMonth() + 1);
            nextPeriodEnd.setMonth(nextPeriodEnd.getMonth() + 1);
        }
        else if (plan.billingCycle === 'yearly') {
            nextBilling.setFullYear(nextBilling.getFullYear() + 1);
            nextPeriodEnd.setFullYear(nextPeriodEnd.getFullYear() + 1);
        }
        subscription.nextBillingDate = nextBilling;
        subscription.currentPeriodEndsAt = nextPeriodEnd;
        subscription.cancelAtPeriodEnd = false;
        subscription.canceledAt = undefined;
        await subscription.save();
        const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
        await User.findByIdAndUpdate(req.user._id, { status: 'active' });
        const populatedSubscription = await Subscription_1.default.findById(subscription._id).populate('planId');
        res.json({
            success: true,
            message: 'Plan updated and subscription reactivated successfully',
            data: populatedSubscription
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.changePlan = changePlan;
const cancelSubscription = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const subscription = await Subscription_1.default.findOne({
            organizationId: req.user.organizationId
        });
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'Subscription not found'
            });
        }
        subscription.cancelAtPeriodEnd = true;
        await subscription.save();
        res.json({
            success: true,
            message: 'Subscription will be cancelled at the end of current period',
            data: { cancelAtPeriodEnd: true }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.cancelSubscription = cancelSubscription;
