import { Router, Response, NextFunction } from "express";
import asyncHandler from 'express-async-handler';
import {
  getTenants,
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant
} from "../controllers/tenantsController";
import { protect } from "../middleware/authMiddleware";
import upload from "../middleware/uploadMiddleware";

const router = Router();

router.use(protect);

const tenantUploadFields = [
  { name: "imageUrl", maxCount: 1 },
  { name: "govtIdImageUrlFront", maxCount: 1 },
  { name: "govtIdImageUrlBack", maxCount: 1 },
];

router
  .route("/")
  .get(asyncHandler(getTenants))
  .post(upload.fields(tenantUploadFields), asyncHandler(createTenant));

router
  .route("/:id")
  .get(asyncHandler(getTenantById))
  .put(upload.fields(tenantUploadFields), asyncHandler(updateTenant))
  .delete(asyncHandler(deleteTenant));

// Add missing tenant details endpoint
router.get('/:id/details', protect, asyncHandler(async (req: Request, res: Response) => {
  const tenant = await Tenant.findById(req.params.id)
    .populate('propertyId', 'name address')
    .populate('leaseId')
    .populate('organizationId', 'name');
  
  if (!tenant) {
    res.status(404).json({ success: false, message: 'Tenant not found' });
    return;
  }
  
  res.json({ success: true, data: tenant });
}));

export default router;
