import { Request, Response } from 'express';

interface AuthRequest extends Request {
  user?: any;
}

export const getSiteSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = {
      siteName: 'HNV Property Management',
      logo: '/logo.png',
      theme: 'default',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timezone: 'UTC'
    };

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateSiteSettings = async (req: AuthRequest, res: Response) => {
  try {
    const settings = {
      ...req.body,
      updatedAt: new Date()
    };

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};