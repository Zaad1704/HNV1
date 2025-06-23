// backend/routes/billingRoutes.ts
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import {
    getSubscriptionDetails,
    createCheckoutSession,
    createRentPaymentSession,
    handlePaymentWebhook,
} from '../controllers/billingController';
import { protect } from '../middleware/authMiddleware';
import { getPlans as getSubscriptionPlans } from '../controllers/planController'; 

const router = Router();

// Get subscription details for the user's organization
router.get('/', protect, asyncHandler(getSubscriptionDetails));

// Create a checkout session for a subscription plan
router.post('/create-checkout-session', protect, asyncHandler(createCheckoutSession));

// Create a checkout session for a one-time rent payment
router.post('/create-rent-payment', protect, asyncHandler(createRentPaymentSession));

// Handle incoming webhooks from the payment provider
router.post('/webhook', asyncHandler(handlePaymentWebhook));

// CORRECTED: Route to get public plans, imported as getSubscriptionPlans
router.get('/plans', asyncHandler(getSubscriptionPlans));

export default router;
