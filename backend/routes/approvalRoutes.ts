import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getApprovals, updateApprovalStatus, createApproval } from '../controllers/approvalController';

const router = Router();

router.use(protect);

router.get('/', getApprovals);
router.post('/', createApproval);
router.put('/:id', updateApprovalStatus);

export default router;