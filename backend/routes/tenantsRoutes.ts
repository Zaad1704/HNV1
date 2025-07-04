import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  getTenants,
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant
} from '../controllers/tenantsController';

const router = Router();

router.use(protect);

router.route('/')
  .get(getTenants)
  .post(createTenant);

router.route('/:id')
  .get(getTenantById)
  .put(updateTenant)
  .delete(deleteTenant);

export default router;
