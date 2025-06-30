import { Request, Response } from 'express';
import SiteSettings from '../models/SiteSettings';
import mongoose from 'mongoose';

export const getSiteSettings = async (req: Request, res: Response) => {
    try {
        let settings = await SiteSettings.findOne();

        if (!settings) {
            settings = new SiteSettings({});
            await settings.save();
        }
        
        res.status(200).json({ success: true, data: settings });

    } catch (error) {
        console.error('Error fetching site settings:', error);
        // Return default settings instead of 500 error
        res.status(200).json({ 
            success: true, 
            data: {
                siteName: 'HNV Property Management',
                siteDescription: 'Professional Property Management Solutions',
                contactEmail: 'support@hnvpm.com',
                maintenanceMode: false
            }
        });
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

// Add specific section update endpoints
export const updateHeroSection = async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }

    try {
        const updatedSettings = await SiteSettings.findOneAndUpdate(
            {},
            { 
                'heroSection': req.body,
                updatedBy: req.user._id 
            },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: updatedSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateLandscapeSection = async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }

    try {
        const updatedSettings = await SiteSettings.findOneAndUpdate(
            {},
            { 
                'landscapeSection': req.body,
                updatedBy: req.user._id 
            },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: updatedSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const updateBannerSection = async (req: Request, res: Response) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }

    try {
        const updatedSettings = await SiteSettings.findOneAndUpdate(
            {},
            { 
                'bannerSection': req.body,
                updatedBy: req.user._id 
            },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: updatedSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
