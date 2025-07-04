"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SubscriptionSchema = new mongoose_1.Schema({ organizationId: {},
    type: mongoose_1.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
}, planId, { type: mongoose_1.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true });
status: {
    type: String,
    ;
    let ;
    (function () {
    })( || ( = {}));
    ["trialing", "active", "inactive", "canceled", "past_due"],
    ;
    "trialing";
}
isLifetime: {
    type: Boolean,
    ;
    false;
}
trialExpiresAt: {
    type: Date,
    ;
}
currentPeriodEndsAt: {
    type: Date,
    ;
}
externalId: {
    type: String;
}
{
    timestamps: true;
}
;
exports.default = (0, mongoose_1.model)("Subscription", SubscriptionSchema);
