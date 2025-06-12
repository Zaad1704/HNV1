import { Router } from 'express';
import {
  getTenants,
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant
} from '../controllers/tenantsController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// Apply the 'protect' middleware to all routes in this file.
// This ensures only authenticated users can perform actions on tenants.
router.use(protect);

// Route for getting all tenants and creating a new one
router.route('/')
  .get(getTenants)
  .post(createTenant);

// Route for getting, updating, or deleting a single tenant by their ID
router.route('/:id')
  .get(getTenantById)
  .put(updateTenant)
  .delete(deleteTenant);

export default router;
