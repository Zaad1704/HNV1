import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getAuditLogs, createAuditLog } from '../controllers/auditController';

const router = Router();

// Protection handled at app level

router.get('/', getAuditLogs);
router.post('/', createAuditLog);

export default router;