import { Request, Response } from 'express';
import SiteSettings from '../models/SiteSettings';
import mongoose from 'mongoose';

export const getSiteSettings = async (req: Request, res: Response) => {
    try {
        let settings = await SiteSettings.findOne();

        if (!settings) {
            console.log('No site settings found, creating default document.');
            settings = new SiteSettings({});
            await settings.save();
        }
        
        res.status(200).json({ success: true, data: settings });

    } catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateSiteSettings = async (req: Request, res: Response) => { 
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }

    try {
        const settingsData = {
            ...req.body,
            updatedBy: req.user._id 
        };
        
        const updatedSettings = await SiteSettings.findOneAndUpdate({}, settingsData, {
            new: true,
            upsert: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: updatedSettings });

    } catch (error) {
        console.error('Error updating site settings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
