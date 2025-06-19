import { Router } from 'express';
import {
    getSubscriptionDetails,
    createCheckoutSession,
    createRentPaymentSession,
    handlePaymentWebhook // This import will now work
} from '../controllers/billingController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Get subscription details for the user's organization
router.get('/', protect, getSubscriptionDetails);

// Create a checkout session for a subscription plan
router.post('/create-checkout-session', protect, createCheckoutSession);

// Create a checkout session for a one-time rent payment
router.post('/create-rent-payment', protect, createRentPaymentSession);

// Handle incoming webhooks from the payment provider
router.post('/webhook', handlePaymentWebhook);

export default router;
