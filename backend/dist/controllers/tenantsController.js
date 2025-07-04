"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTenant = exports.getTenantById = exports.getTenants = void 0;
const Tenant_1 = __importDefault(require("../models/Tenant"));
const Property_1 = __importDefault(require("../models/Property"));
const auditService_1 = __importDefault(require("../services/auditService"));
const getTenants = async (req, res) => {
    try { }
    finally {
    }
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
        const tenants = await Tenant_1.default.find({ organizationId: req.user.organizationId }).populate('propertyId', 'name');
        res.status(200).json({ success: true, count: tenants.length, data: tenants });
    }
    try { }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
    ;
    export const createTenant = async (req, res) => {
        try { }
        finally {
        }
        if (!req.user || !req.user.organizationId) {
            res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
            return;
            const { propertyId } = req.body;
            const property = await Property_1.default.findById(propertyId);
            if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
                res.status(400).json({ success: false, message: 'Invalid property selected.' });
                return;
                const tenantData = { ...req.body, organizationId: req.user.organizationId };
                const tenant = await Tenant_1.default.create(tenantData);
                auditService_1.default.recordAction();
                req.user._id,
                    req.user.organizationId,
                    'TENANT_CREATE',
                    { tenantId: tenant._id.toString(),
                        tenantName: tenant.name,
                        propertyId: property._id.toString() };
            }
        }
    };
};
exports.getTenants = getTenants;
;
res.status(201).json({ success: true, data: tenant });
try { }
catch (error) {
    res.status(400).json({ success: false, message: error.message });
}
;
const getTenantById = async (req, res) => {
    try { }
    finally {
    }
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
        const tenant = await Tenant_1.default.findById(req.params.id);
        if (!tenant) {
            res.status(404).json({ success: false, message: 'Tenant not found' });
            return;
            if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
                res.status(403).json({ success: false, message: 'User not authorized to access this tenant' });
                return;
                res.status(200).json({ success: true, data: tenant });
                try {
                }
                catch (error) {
                    res.status(500).json({ success: false, message: 'Server Error' });
                }
                ;
                export const updateTenant = async (req, res) => {
                    try { }
                    finally {
                    }
                    if (!req.user || !req.user.organizationId) {
                        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
                        return;
                        const originalTenant = await Tenant_1.default.findById(req.params.id).lean();
                        if (!originalTenant) {
                            res.status(404).json({ success: false, message: 'Tenant not found' });
                            return;
                            if (originalTenant.organizationId.toString() !== req.user.organizationId.toString()) {
                                res.status(403).json({ success: false, message: 'User not authorized to update this tenant' });
                                return;
                                const updatedTenant = await Tenant_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
                                if (updatedTenant) {
                                    const changes = {};
                                    for (const key in req.body) {
                                        if (originalTenant[key] !== updatedTenant[key]) { }
                                        changes[key] = { from: originalTenant[key] || 'undefined',
                                            to: updatedTenant[key] };
                                    }
                                    ;
                                    auditService_1.default.recordAction();
                                    req.user._id,
                                        req.user.organizationId,
                                        'TENANT_UPDATE',
                                        { tenantId: updatedTenant._id.toString(), };
                                    tenantName: updatedTenant.name,
                                    ;
                                }
                            }
                        }
                    }
                };
            }
        }
    }
};
exports.getTenantById = getTenantById;
(Object.keys(changes).length > 0 && { changes });
;
res.status(200).json({ success: true, data: updatedTenant });
try { }
catch (error) {
    res.status(400).json({ success: false, message: error.message });
}
;
const deleteTenant = async (req, res) => {
    try { }
    finally {
    }
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
        const tenant = await Tenant_1.default.findById(req.params.id);
        if (!tenant) {
            res.status(404).json({ success: false, message: 'Tenant not found' });
            return;
            if (tenant.organizationId.toString() !== req.user.organizationId.toString()) {
                res.status(403).json({ success: false, message: 'User not authorized to delete this tenant' });
                return;
                await tenant.deleteOne();
                auditService_1.default.recordAction();
                req.user._id,
                    req.user.organizationId,
                    'TENANT_DELETE',
                    { tenantId: tenant._id.toString(), tenantName: tenant.name };
            }
        }
    }
};
exports.deleteTenant = deleteTenant;
;
res.status(200).json({ success: true, data: {} });
try { }
catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
}
;
