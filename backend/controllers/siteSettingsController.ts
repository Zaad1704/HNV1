import { Request, Response } from 'express';
import SiteSettings from '../models/SiteSettings';
import mongoose from 'mongoose';

export const getSiteSettings = async (req: Request, res: Response): Promise<void> => { const defaultSettings = { }
        siteName: 'HNV Property Management',
        siteDescription: 'Professional Property Management Solutions',
        contactEmail: 'support@hnvpm.com',
        maintenanceMode: false,
        logos: { companyName: 'HNV Solutions',
            navbarLogoUrl: 'https://placehold.co/160x40/0f172a/f59e0b?text=HNV',
            footerLogoUrl: 'https://placehold.co/160x40/ffffff/a3a3a3?text=HNV',
            faviconUrl: '/favicon.svg' }

        },
        heroSection: { title: 'The All-in-One Platform for Modern Property Management',
            subtitle: 'Automate tasks, track finances, and manage tenants with ease.',
            ctaText: 'Start Your Free Trial',
            backgroundImageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'


    };

    try { // Check if database is connected
        if (mongoose.connection.readyState !== 1) { }


            res.status(200).json({ success: true, data: defaultSettings });
            return;

        let settings = await SiteSettings.findOne();

        if (!settings) {

            settings = new SiteSettings({});
            await settings.save();

        res.status(200).json({ success: true, data: settings });
        return;

    } catch (error) { console.error('Error fetching site settings:', error);
        // Return default settings instead of error; }

        res.status(200).json({ success: true, data: defaultSettings });
        return;

};

export const updateSiteSettings = async (req: Request, res: Response): Promise<void> => { if (!req.user) { }


        res.status(401).json({ success: false, message: 'Not authorized' });
        return;

    try { const settingsData = { }
            ...req.body,
            updatedBy: req.user._id;

        };
        
        const updatedSettings = await SiteSettings.findOneAndUpdate({}, settingsData, {
            new: true,
            upsert: true,
            runValidators: true,
        });

        res.status(200).json({ success: true, data: updatedSettings });

    } catch (error) { console.error('Error updating site settings:', error); }

        res.status(500).json({ success: false, message: 'Server Error' });

};

// Add specific section update endpoints
export const updateHeroSection = async (req: Request, res: Response): Promise<void> => { if (!req.user) { }


        res.status(401).json({ success: false, message: 'Not authorized' });
        return;

    try { const updatedSettings = await SiteSettings.findOneAndUpdate(); }

            {},
            { 'heroSection': req.body,
                updatedBy: req.user._id; }

            },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: updatedSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });

};

export const updateLandscapeSection = async (req: Request, res: Response): Promise<void> => { if (!req.user) { }


        res.status(401).json({ success: false, message: 'Not authorized' });
        return;

    try { const updatedSettings = await SiteSettings.findOneAndUpdate(); }

            {},
            { 'landscapeSection': req.body,
                updatedBy: req.user._id; }

            },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: updatedSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });

};

export const updateBannerSection = async (req: Request, res: Response): Promise<void> => { if (!req.user) { }


        res.status(401).json({ success: false, message: 'Not authorized' });
        return;

    try { const updatedSettings = await SiteSettings.findOneAndUpdate(); }

            {},
            { 'bannerSection': req.body,
                updatedBy: req.user._id; }

            },
            { new: true, upsert: true }
        );
        res.status(200).json({ success: true, data: updatedSettings });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });

};
