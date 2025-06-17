import { Router } from 'express';
import { createMaintenanceRequest, getMaintenanceRequests, updateMaintenanceRequestStatus } from '../controllers/maintenanceController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// Tenant can create a request
router.post('/', protect, authorize('Tenant'), createMaintenanceRequest);

// Landlord/Agent can view all requests and update them
router.get('/', protect, authorize('Landlord', 'Agent'), getMaintenanceRequests);
router.put('/:id', protect, authorize('Landlord', 'Agent'), updateMaintenanceRequestStatus);

export default router;
