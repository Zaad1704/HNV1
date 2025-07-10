import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getCollectionSheet } from '../controllers/reportController';

const router = Router();

router.use(protect);

router.get('/collection-sheet', getCollectionSheet);

export default router;