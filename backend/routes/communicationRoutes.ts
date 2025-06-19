import { Router } from 'express';
import { sendCustomEmail } from '../controllers/communicationController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac

const router = Router();

router.post('/email', protect, authorize(['Landlord', 'Agent']), sendCustomEmail);

export default router;
