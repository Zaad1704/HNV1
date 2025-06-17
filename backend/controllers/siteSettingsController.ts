import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import SiteSettings from '../models/SiteSettings'; // We created this model earlier
import mongoose from 'mongoose';

// @desc    Get the current site settings
// @route   GET /api/site-settings
// @access  Public
export const getSiteSettings = async (req: Request, res: Response) => {
    try {
        // There should only ever be one settings document. Find it.
        const settings = await SiteSettings.findOne();
        if (!settings) {
            // If no settings exist yet, we can return an empty object
            return res.status(200).json({ success: true, data: {} });
        }
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
        
        // Use findOneAndUpdate with 'upsert: true'.
        // This will update the existing settings document, or create it if it doesn't exist yet.
        const updatedSettings = await SiteSettings.findOneAndUpdate({}, settingsData, {
            new: true,
            upsert: true, // This is the key option
            runValidators: true,
        });

        res.status(200).json({ success: true, data: updatedSettings });

    } catch (error) {
        console.error('Error updating site settings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
