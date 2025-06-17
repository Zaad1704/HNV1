import { Router } from 'express';
import { generateMonthlyCollectionSheet } from '../controllers/reportController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.get('/monthly-collection-sheet', protect, authorize('Landlord', 'Agent'), generateMonthlyCollectionSheet);

export default router;
