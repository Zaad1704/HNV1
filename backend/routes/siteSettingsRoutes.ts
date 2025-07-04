import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getSiteSettings, updateSiteSettings } from '../controllers/siteSettingsController';

const router = Router();

router.use(protect);

router.get('/', getSiteSettings);
router.put('/', updateSiteSettings);

export default router;