import { Router } from 'express';
import {
  createMaintenanceRequest,
  getOrgMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
} from '../controllers/maintenanceController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

router.post('/', protect, authorize('Landlord', 'Agent', 'Tenant', 'Super Admin'), createMaintenanceRequest);
router.get('/', protect, authorize('Landlord', 'Agent', 'Super Admin'), getOrgMaintenanceRequests);
router.get('/:id', protect, authorize('Landlord', 'Agent', 'Tenant', 'Super Admin'), getMaintenanceRequestById);
router.put('/:id', protect, authorize('Landlord', 'Agent', 'Super Admin', 'Tenant'), updateMaintenanceRequest);
router.delete('/:id', protect, authorize('Landlord', 'Agent', 'Super Admin'), deleteMaintenanceRequest);

export default router;
