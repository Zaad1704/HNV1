import { Router } from 'express';
import { createCheckoutSession, handlePaymentWebhook } from '../controllers/billingController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// A logged-in user calls this to start a purchase. It's a protected route.
router.post('/create-checkout-session', protect, createCheckoutSession);

// The payment provider (2Checkout) calls this public URL. It must not be protected.
router.post('/webhook', handlePaymentWebhook);

export default router;
