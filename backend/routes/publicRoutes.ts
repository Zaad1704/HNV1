import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import masterDataService from '../services/masterDataService';
import SiteSettings from '../models/SiteSettings';
import Plan from '../models/Plan';

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
    let settings = await SiteSettings.findOne({});
    
    if (!settings) {
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

// Public plans - connects to super admin plans
router.get('/plans', asyncHandler(async (req, res) => {
  try {
    const plans = await Plan.find({}).sort({ price: 1 });
    res.json({
      success: true,
      data: plans || []
    });
  } catch (error) {
    console.error('Public plans error:', error);
    res.json({
      success: true,
      data: []
    });
  }
}));

// Public stats for landing page
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    const User = require('../models/User');
    const Organization = require('../models/Organization');
    const Property = require('../models/Property');
    
    const [totalUsers, totalOrganizations, totalProperties] = await Promise.all([
      User.countDocuments({}),
      Organization.countDocuments({}),
      Property.countDocuments({})
    ]);
    
    res.json({
      success: true,
      data: {
        totalUsers,
        totalOrganizations,
        totalProperties,
        uptime: 99.9
      }
    });
  } catch (error) {
    console.error('Public stats error:', error);
    res.json({
      success: true,
      data: {
        totalUsers: 0,
        totalOrganizations: 0,
        totalProperties: 0,
        uptime: 99.9
      }
    });
  }
}));

export default router;