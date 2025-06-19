import { Router } from 'express';
import { getSiteSettings, updateSiteSettings } from '../controllers/siteSettingsController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; // CORRECTED: Import authorize from rbac

const router = Router();

router.route('/')
    .get(getSiteSettings)
    .put(protect, authorize(['Super Admin']), updateSiteSettings);

export default router;
