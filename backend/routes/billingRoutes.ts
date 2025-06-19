import { Router } from 'express';
import { 
    createCheckoutSession, 
    handlePaymentWebhook, 
    createRentPaymentSession,
    getSubscriptionDetails
} from '../controllers/billingController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac

const router = Router();

router.get('/', protect, getSubscriptionDetails);

router.post('/create-checkout-session', protect, createCheckoutSession);

router.post('/create-rent-payment-session', protect, authorize(['Tenant']), createRentPaymentSession);

router.post('/webhook', handlePaymentWebhook);

export default router;
