import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import masterDataService from '../services/masterDataService';

const router = Router();

// Public landing page data
router.get('/landing-data', async (req, res) => {
  try {
    const landingData = await masterDataService.getLandingPageData();
    res.json({
      success: true,
      data: landingData
    });
  } catch (error) {
    console.error('Landing data error:', error);
    res.json({
      success: true,
      data: {
        siteSettings: { siteName: 'HNV Property Management' },
        plans: [],
        stats: { totalProperties: 2500, totalUsers: 1000, countriesServed: 25 }
      }
    });
  }
});

// Public site settings
router.get('/site-settings', async (req, res) => {
  try {
    const landingData = await masterDataService.getLandingPageData();
    res.json({
      success: true,
      data: landingData.siteSettings || { siteName: 'HNV Property Management' }
    });
  } catch (error) {
    console.error('Site settings error:', error);
    res.json({
      success: true,
      data: {
        siteName: 'HNV Property Management',
        logos: { companyName: 'HNV Solutions', faviconUrl: '/logo-min.png' }
      }
    });
  }
});

// Public plans
router.get('/plans/public', asyncHandler(async (req, res) => {
  const landingData = await masterDataService.getLandingPageData();
  res.json({
    success: true,
    data: landingData.plans
  });
}));

// Public stats for landing page
router.get('/stats/public', asyncHandler(async (req, res) => {
  const landingData = await masterDataService.getLandingPageData();
  res.json({
    success: true,
    data: landingData.stats
  });
}));

export default router;