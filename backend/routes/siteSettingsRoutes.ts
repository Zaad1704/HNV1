import { Router } from 'express';
import { getSiteSettings } from '../controllers/siteSettingsController';

const router = Router();

router.get('/', getSiteSettings);

export default router;
