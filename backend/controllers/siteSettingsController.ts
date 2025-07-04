import { Request, Response } from 'express';
import SiteSettings from '../models/SiteSettings';

export const getSiteSettings = async (req: Request, res: Response) => {
  try {
    const settings = await SiteSettings.findOne();
    res.json({ success: true, data: settings || {} });
  } catch (error) {
    res.json({ success: true, data: {} });
  }
};