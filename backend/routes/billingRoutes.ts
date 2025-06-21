// backend/routes/billingRoutes.ts
import { Router } from 'express';
import {
    getSubscriptionDetails,
    createCheckoutSession,
    createRentPaymentSession,
    handlePaymentWebhook,
    // REMOVED: getPlans, // This was causing the error as it's not exported from billingController
} from '../controllers/billingController';
import { protect } from '../middleware/authMiddleware';
import { getPlans as getSubscriptionPlans } from '../controllers/planController'; // CORRECTED: Import getPlans from planController

const router = Router();

// Get subscription details for the user's organization
router.get('/', protect, getSubscriptionDetails);

// Create a checkout session for a subscription plan
router.post('/create-checkout-session', protect, createCheckoutSession);

// Create a checkout session for a one-time rent payment
router.post('/create-rent-payment', protect, createRentPaymentSession);

// Handle incoming webhooks from the payment provider
router.post('/webhook', handlePaymentWebhook);

// CORRECTED: Route to get public plans, imported as getSubscriptionPlans
router.get('/plans', getSubscriptionPlans);

export default router;
