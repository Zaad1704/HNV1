"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SubscriptionSchema = new mongoose_1.Schema({
    organizationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true
    },
    planId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    status: {
        type: String,
        enum: ["trialing", "active", "inactive", "canceled", "past_due", "expired"],
        default: "trialing"
    },
    isLifetime: {
        type: Boolean,
        default: false
    },
    trialExpiresAt: {
        type: Date,
    },
    currentPeriodEndsAt: {
        type: Date,
    },
    currentPeriodStartsAt: {
        type: Date,
    },
    nextBillingDate: {
        type: Date,
    },
    cancelAtPeriodEnd: {
        type: Boolean,
        default: false
    },
    canceledAt: {
        type: Date,
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        default: 'USD'
    },
    billingCycle: {
        type: String,
        enum: ['monthly', 'yearly', 'weekly', 'daily'],
        default: 'monthly'
    },
    paymentMethod: {
        type: String
    },
    lastPaymentDate: {
        type: Date
    },
    failedPaymentAttempts: {
        type: Number,
        default: 0
    },
    externalId: {
        type: String
    },
    notes: {
        type: String
    },
    maxProperties: {
        type: Number,
        default: -1
    },
    maxTenants: {
        type: Number,
        default: -1
    },
    maxAgents: {
        type: Number,
        default: -1
    },
    maxUsers: {
        type: Number,
        default: -1
    },
    currentProperties: {
        type: Number,
        default: 0
    },
    currentTenants: {
        type: Number,
        default: 0
    },
    currentAgents: {
        type: Number,
        default: 0
    },
    currentUsers: {
        type: Number,
        default: 0
    },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Subscription", SubscriptionSchema);
