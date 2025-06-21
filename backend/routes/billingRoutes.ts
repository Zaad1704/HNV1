// backend/routes/billingRoutes.ts
import { Router } from 'express';
import {
    getSubscriptionDetails,
    createCheckoutSession,
    createRentPaymentSession,
    handlePaymentWebhook,
    getPlans // Import getPlans
} from '../controllers/billingController'; // Ensure getPlans is exported from billingController
import { protect } from '../middleware/authMiddleware';
import { getPlans as getSubscriptionPlans } from '../controllers/planController'; // Import from planController

const router = Router();

// Get subscription details for the user's organization
router.get('/', protect, getSubscriptionDetails);

// Create a checkout session for a subscription plan
router.post('/create-checkout-session', protect, createCheckoutSession);

// Create a checkout session for a one-time rent payment
router.post('/create-rent-payment', protect, createRentPaymentSession);

// Handle incoming webhooks from the payment provider
router.post('/webhook', handlePaymentWebhook);

// New route to get public plans (assuming plans are managed by Super Admin via /api/plans)
// This might be redundant if the frontend fetches plans from /api/plans directly.
// If not, you could fetch them here or expose a public route via planRoutes.ts.
// For now, assuming you want to expose it via billing for simplicity.
// A better approach might be to access /api/plans directly as it's already public GET.
// However, as per your request for a correction *within* billing, I'll add a placeholder for that.

// Option 1: Expose plans from PlanController via this route (less ideal as it duplicates logic)
router.get('/plans', getSubscriptionPlans); // Use the getPlans from planController

// Option 2: Add a getPlans function to billingController if you prefer all billing related things here
// This would need getPlans to be defined in billingController
// router.get('/plans', getPlans);

export default router;
