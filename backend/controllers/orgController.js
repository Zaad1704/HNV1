"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyOrgBranding = exports.setOrgStatus = exports.listOrganizations = exports.getOrganizationDetails = void 0;
const Organization_1 = __importDefault(require("../models/Organization"));
const getOrganizationDetails = async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const organization = await Organization_1.default.findById(req.user.organizationId)
            .populate('owner', 'name email')
            .populate({
            path: 'subscription',
            model: 'Subscription',
            populate: {
                path: 'planId',
                model: 'Plan',
                select: 'name price duration'
            }
        });
        if (!organization) {
            res.status(404).json({ success: false, message: 'Organization not found' });
            return;
        }
        res.status(200).json({ success: true, data: organization });
    }
    catch (error) {
        console.error("Error fetching organization details:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.getOrganizationDetails = getOrganizationDetails;
const listOrganizations = async (req, res) => {
    try {
        const organizations = await Organization_1.default.find({})
            .populate('owner', 'name email')
            .populate({
            path: 'subscription',
            model: 'Subscription',
            populate: {
                path: 'planId',
                model: 'Plan',
                select: 'name'
            }
        });
        const formattedOrgs = organizations.map(org => ({
            id: org._id,
            name: org.name,
            owner: org.owner ? { name: org.owner.name, email: org.owner.email } : null,
            plan: org.subscription?.planId?.name || 'N/A',
            status: org.status,
            nextBillingDate: org.subscription?.currentPeriodEndsAt || null,
            userCount: org.members.length
        }));
        res.status(200).json({ success: true, data: formattedOrgs });
    }
    catch (error) {
        console.error("Error listing organizations:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.listOrganizations = listOrganizations;
const setOrgStatus = async (req, res) => {
    const { orgId, status } = req.body;
    if (!orgId || !status) {
        res.status(400).json({ success: false, message: 'Organization ID and status are required.' });
        return;
    }
    try {
        const organization = await Organization_1.default.findByIdAndUpdate(orgId, { status }, { new: true });
        if (!organization) {
            res.status(404).json({ success: false, message: 'Organization not found.' });
            return;
        }
        res.status(200).json({ success: true, message: `Organization ${organization.name} status updated to ${organization.status}.`, data: organization });
    }
    catch (error) {
        console.error("Error setting organization status:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.setOrgStatus = setOrgStatus;
const updateMyOrgBranding = async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
    }
    try {
        const organization = await Organization_1.default.findById(req.user.organizationId);
        if (!organization) {
            return res.status(404).json({ success: false, message: 'Organization not found' });
        }
        if (organization.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the organization owner can update branding settings.' });
        }
        // FIX: Ensure the branding object exists before trying to modify it.
        if (!organization.branding) {
            organization.branding = { companyName: '', companyLogoUrl: '', companyAddress: '' };
        }
        const { companyName, companyAddress } = req.body;
        if (companyName) {
            organization.branding.companyName = companyName;
        }
        if (companyAddress) {
            organization.branding.companyAddress = companyAddress;
        }
        if (req.file) {
            organization.branding.companyLogoUrl = req.file.imageUrl || req.file.path;
        }
        await organization.save();
        res.status(200).json({ success: true, message: 'Branding updated successfully.', data: organization.branding });
    }
    catch (error) {
        console.error("Error updating organization branding:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
exports.updateMyOrgBranding = updateMyOrgBranding;
//# sourceMappingURL=orgController.js.map