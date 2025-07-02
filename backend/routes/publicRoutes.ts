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

// Public site settings - connects to super admin editor
router.get('/site-settings', async (req, res) => {
  try {
    // Get site settings from database (saved by super admin)
    const SiteSettings = require('../models/SiteSettings');
    let settings = await SiteSettings.findOne({});
    
    if (!settings) {
      // Create default settings if none exist
      settings = await SiteSettings.create({
        siteName: 'HNV Property Management',
        contactEmail: 'support@hnvpm.com',
        siteDescription: 'Professional Property Management Solutions',
        heroTitle: 'The All-in-One Platform for Modern Property Management',
        heroSubtitle: 'Streamline your property management with our comprehensive solution',
        statsTitle: 'Trusted by Property Managers Worldwide',
        statsSubtitle: 'Join thousands of property managers who trust our platform'
      });
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Site settings error:', error);
    res.json({
      success: true,
      data: {
        siteName: 'HNV Property Management',
        contactEmail: 'support@hnvpm.com',
        siteDescription: 'Professional Property Management Solutions',
        heroTitle: 'The All-in-One Platform for Modern Property Management',
        statsTitle: 'Trusted by Property Managers Worldwide'
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