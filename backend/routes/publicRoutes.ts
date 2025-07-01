import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import masterDataService from '../services/masterDataService';

const router = Router();

// Public landing page data
router.get('/landing-data', asyncHandler(async (req, res) => {
  const landingData = await masterDataService.getLandingPageData();
  res.json({
    success: true,
    data: landingData
  });
}));

// Public site settings
router.get('/site-settings', asyncHandler(async (req, res) => {
  const landingData = await masterDataService.getLandingPageData();
  res.json({
    success: true,
    data: landingData.siteSettings
  });
}));

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