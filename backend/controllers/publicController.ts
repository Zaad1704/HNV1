import { Request, Response } from 'express';
import Organization from '../models/Organization';
import User from '../models/User';
import Property from '../models/Property';
import SiteSettings from '../models/SiteSettings';

export const getPublicStats = async (req: Request, res: Response) => {
  try {
    const [totalOrganizations, totalUsers, totalProperties] = await Promise.all([
      Organization.countDocuments({ status: 'active' }),
      User.countDocuments({ isActive: true }),
      Property.countDocuments()
    ]);

    const stats = {
      totalOrganizations,
      totalUsers,
      totalProperties,
      uptime: 99.9,
      lastUpdated: new Date().toISOString()
    };

    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes cache
      'ETag': `"${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Public stats error:', error);
    res.json({
      success: true,
      data: {
        totalOrganizations: 0,
        totalUsers: 0,
        totalProperties: 0,
        uptime: 99.9,
        lastUpdated: new Date().toISOString()
      }
    });
  }
};

export const getSiteSettings = async (req: Request, res: Response) => {
  try {
    const settings = await SiteSettings.findOne();
    const settingsData = settings || {};
    
    res.set({
      'Cache-Control': 'public, max-age=60',
      'ETag': `"${settings?.updatedAt || Date.now()}"`,
      'Last-Modified': (settings?.updatedAt || new Date()).toUTCString()
    });

    res.json({ success: true, data: settingsData });
  } catch (error) {
    console.error('Site settings error:', error);
    res.json({ success: true, data: {} });
  }
};

export const getPublicData = async (req: Request, res: Response) => {
  try {
    const [stats, settings] = await Promise.all([
      getPublicStatsData(),
      SiteSettings.findOne()
    ]);

    const publicData = {
      stats,
      settings,
      lastUpdated: new Date().toISOString()
    };

    res.set({
      'Cache-Control': 'public, max-age=300',
      'ETag': `"${Date.now()}"`,
      'Last-Modified': new Date().toUTCString()
    });

    res.json({ success: true, data: publicData });
  } catch (error) {
    console.error('Public data error:', error);
    res.json({ success: true, data: { stats: {}, settings: {} } });
  }
};

async function getPublicStatsData() {
  try {
    const [totalOrganizations, totalUsers, totalProperties] = await Promise.all([
      Organization.countDocuments({ status: 'active' }),
      User.countDocuments({ isActive: true }),
      Property.countDocuments()
    ]);

    return {
      totalOrganizations,
      totalUsers,
      totalProperties,
      uptime: 99.9
    };
  } catch (error) {
    return {
      totalOrganizations: 0,
      totalUsers: 0,
      totalProperties: 0,
      uptime: 99.9
    };
  }
}