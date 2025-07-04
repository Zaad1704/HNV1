import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getAuditLogs, createAuditLog } from '../controllers/auditController';

const router = Router();

router.use(protect);

router.get('/', getAuditLogs);
router.post('/', createAuditLog);

export default router;