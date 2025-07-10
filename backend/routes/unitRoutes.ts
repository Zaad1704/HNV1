import { Router } from 'express';
import { getPropertyUnits } from '../controllers/unitController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.use(protect);

// Get units for a specific property
router.get('/properties/:propertyId/units', getPropertyUnits);

export default router;