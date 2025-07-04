import { Router } from 'express';
import { getCollectionPeriod,
  generateCollectionPeriod,
  createCollectionSheet,
  downloadCollectionSheet,
  recordCollectionAction,
  getCollectionActions,
  getCollectionAnalytics,
  getOverduePayments,
  updateTenantNotes; }

} from '../controllers/rentCollectionController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac';

const router = Router();

// All rent collection routes require authentication
router.use(protect);

// Collection period management
router.get('/period/:year/:month', getCollectionPeriod);
router.post('/period/:year/:month/generate', authorize(['Landlord', 'Agent']), generateCollectionPeriod);

// Collection sheet management
router.post('/sheet/:periodId/create', authorize(['Landlord', 'Agent']), createCollectionSheet);
router.get('/sheet/:id/download', downloadCollectionSheet);

// Collection actions
router.post('/action', authorize(['Landlord', 'Agent']), recordCollectionAction);
router.get('/actions', getCollectionActions);

// Analytics and reporting
router.get('/analytics', getCollectionAnalytics);
router.get('/overdue', getOverduePayments);

// Tenant management
router.put('/period/:periodId/tenant/:tenantId/notes', authorize(['Landlord', 'Agent']), updateTenantNotes);

export default router;