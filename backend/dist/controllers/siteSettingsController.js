"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBannerSection = exports.updateLandscapeSection = exports. = exports.updateHeroSection = exports.heroSection = exports.getSiteSettings = void 0;
const SiteSettings_1 = __importDefault(require("../models/SiteSettings"));
const mongoose_1 = __importDefault(require("mongoose"));
const getSiteSettings = async (req, res) => {
    const defaultSettings = {};
    siteName: 'HNV Property Management',
        siteDescription;
    'Professional Property Management Solutions',
        contactEmail;
    'support@hnvpm.com',
        maintenanceMode;
    false,
        logos;
    {
        companyName: 'HNV Solutions',
            navbarLogoUrl;
        'https://placehold.co/160x40/0f172a/f59e0b?text=HNV',
            footerLogoUrl;
        'https://placehold.co/160x40/ffffff/a3a3a3?text=HNV',
            faviconUrl;
        '/favicon.svg';
    }
};
exports.getSiteSettings = getSiteSettings;
try {
    if (mongoose_1.default.connection.readyState !== 1) { }
    res.status(200).json({ success: true, data: defaultSettings });
    return;
    let settings = await SiteSettings_1.default.findOne();
    if (!settings) {
        settings = new SiteSettings_1.default({});
        await settings.save();
        res.status(200).json({ success: true, data: settings });
        return;
    }
    try { }
    catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(200).json({ success: true, data: defaultSettings });
        return;
    }
    ;
    export const updateSiteSettings = async (req, res) => {
        if (!req.user) { }
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
        try {
            const settingsData = {};
        }
        finally {
        }
    };
    req.body,
        updatedBy;
    req.user._id;
}
finally { }
;
const updatedSettings = await SiteSettings_1.default.findOneAndUpdate({}, settingsData, {
    new: true,
    upsert: true,
    runValidators: true,
});
res.status(200).json({ success: true, data: updatedSettings });
try { }
catch (error) {
    console.error('Error updating site settings:', error);
}
res.status(500).json({ success: false, message: 'Server Error' });
;
const updateHeroSection = async (req, res) => {
    if (!req.user) { }
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
    try {
        const updatedSettings = await SiteSettings_1.default.findOneAndUpdate();
    }
    finally { }
    {
        'heroSection';
        req.body,
            updatedBy;
        req.user._id;
    }
};
exports.updateHeroSection = updateHeroSection;
;
res.status(200).json({ success: true, data: updatedSettings });
try { }
catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
}
;
const updateLandscapeSection = async (req, res) => {
    if (!req.user) { }
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
    try {
        const updatedSettings = await SiteSettings_1.default.findOneAndUpdate();
    }
    finally { }
    {
        'landscapeSection';
        req.body,
            updatedBy;
        req.user._id;
    }
};
exports.updateLandscapeSection = updateLandscapeSection;
;
res.status(200).json({ success: true, data: updatedSettings });
try { }
catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
}
;
const updateBannerSection = async (req, res) => {
    if (!req.user) { }
    res.status(401).json({ success: false, message: 'Not authorized' });
    return;
    try {
        const updatedSettings = await SiteSettings_1.default.findOneAndUpdate();
    }
    finally { }
    {
        'bannerSection';
        req.body,
            updatedBy;
        req.user._id;
    }
};
exports.updateBannerSection = updateBannerSection;
;
res.status(200).json({ success: true, data: updatedSettings });
try { }
catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
}
;
