import { Router } from 'express';
import { sendCustomEmail } from '../controllers/communicationController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This route is protected and only available to Landlords and Agents
router.post('/email', protect, authorize('Landlord', 'Agent'), sendCustomEmail);

export default router;
