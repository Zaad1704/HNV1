import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  updateMaintenanceRequest,
  deleteMaintenanceRequest
} from '../controllers/maintenanceController';

const router = Router();

router.use(protect);

router.route('/')
  .get(getMaintenanceRequests)
  .post(createMaintenanceRequest);

router.route('/:id')
  .put(updateMaintenanceRequest)
  .delete(deleteMaintenanceRequest);

export default router;
