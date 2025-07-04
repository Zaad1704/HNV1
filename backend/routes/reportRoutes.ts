import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { generateFinancialReport } from '../controllers/reportController';

const router = Router();

router.use(protect);

router.get('/financial', generateFinancialReport);

export default router;