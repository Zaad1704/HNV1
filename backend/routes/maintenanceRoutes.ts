import { Router } from 'express';
import {
    createMaintenanceRequest,
    getOrgMaintenanceRequests,
    getMaintenanceRequestById,
    updateMaintenanceRequest,
    deleteMaintenanceRequest
} from '../controllers/maintenanceController';
import { protect } from '../middleware/authMiddleware';

const router = Router();
router.use(protect);

router.route('/')
    .post(createMaintenanceRequest)
    .get(getOrgMaintenanceRequests);
    
router.route('/:id')
    .get(getMaintenanceRequestById)
    .put(updateMaintenanceRequest)
    .delete(deleteMaintenanceRequest);

export default router;
