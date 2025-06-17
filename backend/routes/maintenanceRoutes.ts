import { Router } from 'express';
import { createMaintenanceRequest } from '../controllers/maintenanceController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// This route is protected and only available to Tenants
router.post('/', protect, authorize('Tenant'), createMaintenanceRequest);

export default router;
