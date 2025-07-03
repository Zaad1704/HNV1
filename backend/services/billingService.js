"use strict";
// services/billingService.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.billingPlans = void 0;
exports.createSubscription2CO = createSubscription2CO;
// Mock data for available billing plans
exports.billingPlans = [
    { id: 'plan_basic', name: 'Basic', price: 10, currency: 'USD' },
    { id: 'plan_pro', name: 'Pro', price: 25, currency: 'USD' },
];
/**
 * Mocks creating a subscription with a billing provider like 2Checkout.
 * In a real application, this function would make an API call.
 */
async function createSubscription2CO(orgId, planId, userEmail) {

    const planDetails = exports.billingPlans.find(p => p.id === planId);
    if (!planDetails) {
        throw new Error('Invalid plan ID provided.');
    }
    // In a real app, you would get this data back from the billing provider's API.
    const subscriptionDetails = {
        plan: planDetails.name,
        status: 'active',
        // Set renewal date to 30 days from now
        renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        externalId: `mock_sub_${Date.now()}` // A fake subscription ID
    };
    // THE FIX: This function must return the subscription data object.
    return subscriptionDetails;
}
//# sourceMappingURL=billingService.js.map