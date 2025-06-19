import { Router } from 'express';
import { generateMonthlyCollectionSheet } from '../controllers/reportController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac

const router = Router();

router.get('/monthly-collection-sheet', protect, authorize(['Landlord', 'Agent']), generateMonthlyCollectionSheet);

export default router;
