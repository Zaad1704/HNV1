import { Router } from 'express';
import asyncHandler from 'express-async-handler';
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
    .post(asyncHandler(createMaintenanceRequest))
    .get(asyncHandler(getOrgMaintenanceRequests));
    
router.route('/:id')
    .get(asyncHandler(getMaintenanceRequestById))
    .put(asyncHandler(updateMaintenanceRequest))
    .delete(asyncHandler(deleteMaintenanceRequest));

export default router;
