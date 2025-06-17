import { Router } from 'express';
import { getSiteSettings, updateSiteSettings } from '../controllers/siteSettingsController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = Router();

// The GET route is public so the landing page can fetch the settings.
// The PUT route is protected for Super Admins only.
router.route('/')
    .get(getSiteSettings)
    .put(protect, authorize('Super Admin'), updateSiteSettings);

export default router;
