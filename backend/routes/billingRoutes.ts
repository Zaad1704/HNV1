import { Router } from 'express';
import { 
    createCheckoutSession, 
    handlePaymentWebhook, 
    createRentPaymentSession,
    getSubscriptionDetails // Import the new function
} from '../controllers/billingController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Route to get current user's subscription details
router.get('/', protect, getSubscriptionDetails);

// Route for subscribing to a plan
router.post('/create-checkout-session', protect, createCheckoutSession);

// --- NEW ROUTE for Rent Payments ---
// This route is protected and only available to users with the 'Tenant' role.
router.post('/create-rent-payment-session', protect, authorize('Tenant'), createRentPaymentSession);

// Public webhook route from the payment provider
router.post('/webhook', handlePaymentWebhook);

export default router;
