// backend/routes/maintenanceRoutes.ts

import { Router } from 'express';
import {
  createMaintenanceRequest,
  getOrgMaintenanceRequests,
  getMaintenanceRequestById,
  updateMaintenanceRequest,
  deleteMaintenanceRequest
} from '../controllers/maintenanceController'; // Import controller functions
import { protect, authorize } from '../middleware/authMiddleware'; // Import auth middleware

const router = Router();

// Apply 'protect' middleware to all routes in this file.
// This ensures only authenticated users can access maintenance request endpoints.
router.use(protect);

// Routes for creating and getting all maintenance requests for an organization
router.route('/')
  .post(createMaintenanceRequest) // Any authenticated user can create a request
  .get(authorize('Landlord', 'Agent', 'Super Admin'), getOrgMaintenanceRequests); // Only specific roles can view all requests

// Routes for specific maintenance requests by ID
router.route('/:id')
  .get(getMaintenanceRequestById) // Logic inside controller handles authorization for specific roles/tenants
  .put(updateMaintenanceRequest) // Logic inside controller handles authorization for specific roles/tenants
  .delete(authorize('Landlord', 'Agent', 'Super Admin'), deleteMaintenanceRequest); // Only specific roles can delete requests

export default router;
