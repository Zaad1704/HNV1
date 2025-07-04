import { Router, Response, NextFunction } from "express";
import asyncHandler from 'express-async-handler';
import { getTenants,
  createTenant,
  getTenantById,
  updateTenant,
  deleteTenant; }

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

// Tenant details endpoint for modal
router.get("/:id/details", asyncHandler(getTenantById));

export default router;
