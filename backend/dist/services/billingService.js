"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingPlans = void 0;
exports.billingPlans = [
    { id: 'plan_basic', name: 'Basic', price: 10, currency: 'USD' },
    { id: 'plan_pro', name: 'Pro', price: 25, currency: 'USD' },
];
orgId: string,
    planId;
string,
    userEmail;
string;
Promise < SubscriptionData > {
    const: planDetails = exports.billingPlans.find(p => p.id === planId),
    if(, planDetails) { },
    throw: new Error('Invalid plan ID provided.'),
    const: subscriptionDetails = { plan: planDetails.name,
        status: 'active',
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), },
    externalId: `mock_sub_${Date.now()}`
};
