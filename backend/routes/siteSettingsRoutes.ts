import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getSiteSettings, updateSiteSettings, updateHeroSection, updateLandscapeSection, updateBannerSection } from '../controllers/siteSettingsController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; 

const router = Router();

router.route('/')
    .get(asyncHandler(getSiteSettings)) 
    .put(protect, authorize(['Super Admin']), asyncHandler(updateSiteSettings));

// Specific section updates
router.put('/hero', protect, authorize(['Super Admin']), asyncHandler(updateHeroSection));
router.put('/landscape', protect, authorize(['Super Admin']), asyncHandler(updateLandscapeSection));
router.put('/banner', protect, authorize(['Super Admin']), asyncHandler(updateBannerSection));

export default router;
