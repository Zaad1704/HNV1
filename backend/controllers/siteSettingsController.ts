import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import SiteSettings from '../models/SiteSettings';
import mongoose from 'mongoose';

// @desc    Get the current site settings
// @route   GET /api/site-settings
// @access  Public
export const getSiteSettings = async (req: Request, res: Response) => {
    try {
        let settings = await SiteSettings.findOne();

        // If no settings document exists in the database...
        if (!settings) {
            // ...create a new one with the default values from your schema and save it.
            console.log('No site settings found, creating default document.');
            settings = new SiteSettings({});
            await settings.save();
        }
        
        // Always return a complete settings object.
        res.status(200).json({ success: true, data: settings });

    } catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create or Update the site settings
// @route   PUT /api/site-settings
// @access  Private (Super Admin)
export const updateSiteSettings = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    try {
        const settingsData = {
            ...req.body,
            updatedBy: new mongoose.Types.ObjectId(req.user.id)
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
