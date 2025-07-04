import { Router } from 'express';
import SiteSettings from '../models/SiteSettings';

const router = Router();

// Public route for landing page
router.get('/', async (req, res) => {
  try {
    const settings = await SiteSettings.findOne().select('siteName logo contactInfo');
    res.json({ success: true, data: settings || {} });
  } catch (error) {
    res.json({ success: true, data: {} });
  }
});

export default router;
