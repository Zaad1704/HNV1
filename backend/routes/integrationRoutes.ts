import { Router } from 'express';
import {
  getIntegrations,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  createPaymentIntent,
  handleStripeWebhook,
  globalSearch,
  searchSuggestions,
  getPerformanceMetrics,
  optimizeDatabase,
  cleanupData
} from '../controllers/integrationController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// Integration management
router.use(protect);
router.get('/', getIntegrations);
router.post('/', authorize(['Landlord']), createIntegration);
router.put('/:id', authorize(['Landlord']), updateIntegration);
router.delete('/:id', authorize(['Landlord']), deleteIntegration);

// Payment processing
router.post('/payment/intent', createPaymentIntent);

// Search functionality
router.get('/search', globalSearch);
router.get('/search/suggestions', searchSuggestions);

// Performance and optimization
router.get('/performance', authorize(['Landlord']), getPerformanceMetrics);
router.post('/optimize', authorize(['Super Admin']), optimizeDatabase);
router.post('/cleanup', authorize(['Super Admin']), cleanupData);

// Webhook endpoints (no auth required)
router.post('/webhooks/stripe/:organizationId', handleStripeWebhook);

export default router;