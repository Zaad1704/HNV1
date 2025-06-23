import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getSiteSettings, updateSiteSettings } from '../controllers/siteSettingsController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; 

const router = Router();

router.route('/')
    .get(asyncHandler(getSiteSettings)) 
    .put(protect, authorize(['Super Admin']), asyncHandler(updateSiteSettings));

export default router;
