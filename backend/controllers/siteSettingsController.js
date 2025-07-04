"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSiteSettings = exports.getSiteSettings = void 0;
const SiteSettings_1 = __importDefault(require("../models/SiteSettings"));
const getSiteSettings = async (req, res) => {
    try {
        let settings = await SiteSettings_1.default.findOne();
        if (!settings) {

            settings = new SiteSettings_1.default({});
            await settings.save();

        res.status(200).json({ success: true, data: settings });

    catch (error) {
        console.error('Error fetching site settings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });

};
exports.getSiteSettings = getSiteSettings;
const updateSiteSettings = async (req, res) => {
    if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;

    try {
        const settingsData = {
            ...req.body,
            updatedBy: req.user._id
        };
        const updatedSettings = await SiteSettings_1.default.findOneAndUpdate({}, settingsData, {
            new: true,
            upsert: true,
            runValidators: true,
        });
        res.status(200).json({ success: true, data: updatedSettings });

    catch (error) {
        console.error('Error updating site settings:', error);
        res.status(500).json({ success: false, message: 'Server Error' });

};
exports.updateSiteSettings = updateSiteSettings;
//# sourceMappingURL=siteSettingsController.js.map