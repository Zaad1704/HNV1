import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getApprovals, createApprovalRequest, updateApproval } from '../controllers/approvalController';

const router = Router();

router.use(protect);

router.get('/', getApprovals);
router.post('/', createApprovalRequest);
router.put('/:id', updateApproval);

export default router;