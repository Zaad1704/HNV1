"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMaintenanceRequest = exports.getMaintenanceRequestById = exports.updateMaintenanceRequest = exports.getMaintenanceRequests = exports.createMaintenanceRequest = void 0;
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const Property_1 = __importDefault(require("../models/Property"));
const createMaintenanceRequest = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { propertyId, tenantId, description, priority, category } = req.body;
        if (!propertyId || !description) {
            return res.status(400).json({
                success: false,
                message: 'Property ID and description are required'
            });
        }
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Invalid property'
            });
        }
        const newRequest = await MaintenanceRequest_1.default.create({
            organizationId: req.user.organizationId,
            propertyId,
            tenantId,
            description,
            status: 'Open',
            priority: priority || 'Medium',
            category,
            requestedBy: req.user._id
        });
        res.status(201).json({ success: true, data: newRequest });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.createMaintenanceRequest = createMaintenanceRequest;
const getMaintenanceRequests = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const { tenantId, propertyId, status } = req.query;
        const filter = { organizationId: req.user.organizationId };
        if (tenantId)
            filter.tenantId = tenantId;
        if (propertyId)
            filter.propertyId = propertyId;
        if (status)
            filter.status = status;
        const requests = await MaintenanceRequest_1.default.find(filter)
            .populate('propertyId', 'name address')
            .populate('tenantId', 'name unit')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMaintenanceRequests = getMaintenanceRequests;
const updateMaintenanceRequest = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const request = await MaintenanceRequest_1.default.findById(req.params.id);
        if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        const updatedRequest = await MaintenanceRequest_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updatedRequest });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.updateMaintenanceRequest = updateMaintenanceRequest;
const getMaintenanceRequestById = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const request = await MaintenanceRequest_1.default.findById(req.params.id)
            .populate('propertyId', 'name address')
            .populate('tenantId', 'name email phone unit')
            .populate('requestedBy', 'name email')
            .populate('organizationId', 'name');
        if (!request) {
            return res.status(404).json({ success: false, message: 'Maintenance request not found' });
        }
        if (request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized to view this request' });
        }
        res.status(200).json({ success: true, data: request });
    }
    catch (error) {
        console.error('Get maintenance request by ID error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.getMaintenanceRequestById = getMaintenanceRequestById;
const deleteMaintenanceRequest = async (req, res) => {
    try {
        if (!req.user?.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const request = await MaintenanceRequest_1.default.findById(req.params.id);
        if (!request || request.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ success: false, message: 'Request not found' });
        }
        await request.deleteOne();
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
exports.deleteMaintenanceRequest = deleteMaintenanceRequest;
