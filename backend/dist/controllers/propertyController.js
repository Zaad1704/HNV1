"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getProperties = exports.createProperty = void 0;
const Property_1 = __importDefault(require("../models/Property"));
const actionChainService_1 = __importDefault(require("../services/actionChainService"));
const createProperty = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    const subscriptionService = (await Promise.resolve().then(() => __importStar(require('../services/subscriptionService')))).default;
    const usageCheck = await subscriptionService.checkUsageLimit(user.organizationId, 'properties');
    if (!usageCheck.allowed) {
        res.status(403).json({
            success: false,
            message: 'Property limit exceeded',
            reason: usageCheck.reason,
            currentUsage: usageCheck.currentUsage,
            limit: usageCheck.limit
        });
        return;
    }
    try {
        const imageUrl = req.file ? req.file.imageUrl : undefined;
        const property = await Property_1.default.create({
            ...req.body,
            imageUrl: imageUrl,
            organizationId: user.organizationId,
            createdBy: user._id,
            managedByAgentId: req.body.managedByAgentId || null
        });
        await actionChainService_1.default.onPropertyAdded(property, user._id, user.organizationId);
        await subscriptionService.updateUsage(user.organizationId, 'properties', 1);
        res.status(201).json({
            success: true,
            data: property
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
exports.createProperty = createProperty;
const getProperties = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        let query = { organizationId: user.organizationId };
        if (user.role === 'Agent') {
            const userData = await require('../models/User').default.findById(user._id).select('managedProperties');
            const managedPropertyIds = userData?.managedProperties || [];
            query = {
                organizationId: user.organizationId,
                _id: { $in: managedPropertyIds }
            };
        }
        const properties = await Property_1.default.find(query)
            .populate('createdBy', 'name')
            .populate('managedByAgentId', 'name')
            .lean()
            .exec() || [];
        res.status(200).json({ success: true, data: properties });
    }
    catch (error) {
        console.error('Get properties error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch properties',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.getProperties = getProperties;
const getPropertyById = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        if (property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to view this property' });
            return;
        }
        res.status(200).json({ success: true, data: property });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getPropertyById = getPropertyById;
const updateProperty = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        let property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        if (property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to update this property' });
            return;
        }
        const updates = { ...req.body };
        if (req.file) {
            updates.imageUrl = req.file.imageUrl;
        }
        property = await Property_1.default.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: property });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        if (property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
            return;
        }
        await property.deleteOne();
        res.status(200).json({ success: true, data: {} });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.deleteProperty = deleteProperty;
