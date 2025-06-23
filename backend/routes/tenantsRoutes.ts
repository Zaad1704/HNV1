import { Router } from 'express';
import {
  getTenants,
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant
} from '../controllers/tenantsController';
import { protect } from '../middleware/authMiddleware';
import upload from '../middleware/uploadMiddleware'; // Import upload middleware

const router = Router();

router.use(protect);

// Define the fields that can accept file uploads
const tenantUploadFields = [
    { name: 'imageUrl', maxCount: 1 },
    { name: 'govtIdImageUrlFront', maxCount: 1 },
    { name: 'govtIdImageUrlBack', maxCount: 1 }
    // Note: We'll handle additional adult images dynamically in the controller
];

router.route('/')
  .get(getTenants)
  // Use upload.fields() to handle multiple, specific file inputs
  .post(upload.fields(tenantUploadFields), createTenant);

router.route('/:id')
  .get(getTenantById)
  // Also apply to the update route for future enhancements
  .put(upload.fields(tenantUploadFields), updateTenant)
  .delete(deleteTenant);

export default router;
