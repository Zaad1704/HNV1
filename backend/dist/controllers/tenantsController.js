"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTenant = exports.updateTenant = exports.getTenantById = exports.createTenant = exports.getTenants = void 0;
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Property_1 = __importDefault(require("../models/Property"));
const actionChainService_1 = __importDefault(require("../services/actionChainService"));
const getTenants = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const tenants = await Tenant_1.default.find({
            organizationId: req.user.organizationId
        }).populate('propertyId', 'name') || [];
        res.status(200).json({ success: true, data: tenants });
    }
    catch (error) {
        console.error('Get tenants error:', error);
        res.status(200).json({ success: true, data: [] });
    }
};
exports.getTenants = getTenants;
const createTenant = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { propertyId } = req.body;
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid property'
            });
        }
        const tenantData = {
            ...req.body,
            organizationId: req.user.organizationId
        };
        const tenant = await Tenant_1.default.create(tenantData);
        await actionChainService_1.default.onTenantAdded(tenant, req.user._id, req.user.organizationId);
        res.status(201).json({ success: true, data: tenant });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createTenant = createTenant;
const getTenantById = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const tenant = await Tenant_1.default.findById(req.params.id);
        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        res.status(200).json({ success: true, data: tenant });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getTenantById = getTenantById;
const updateTenant = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const tenant = await Tenant_1.default.findById(req.params.id);
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        const updatedTenant = await Tenant_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedTenant });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateTenant = updateTenant;
const deleteTenant = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const tenant = await Tenant_1.default.findById(req.params.id);
        if (!tenant || tenant.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }
        await tenant.deleteOne();
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteTenant = deleteTenant;
