import { Router, Response, NextFunction } from "express";
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

// Define the fields that can accept file uploads
const tenantUploadFields = [
  { name: "imageUrl", maxCount: 1 },
  { name: "govtIdImageUrlFront", maxCount: 1 },
  { name: "govtIdImageUrlBack", maxCount: 1 },
  // Additional adult images can be handled dynamically in the controller if needed
];

router
  .route("/")
  .get(getTenants)
  .post(upload.fields(tenantUploadFields), createTenant);

router
  .route("/:id")
  .get(getTenantById)
  .put(upload.fields(tenantUploadFields), updateTenant)
  .delete(deleteTenant);

export default router;
