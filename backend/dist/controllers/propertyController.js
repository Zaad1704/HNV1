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
exports.getPropertyUnits = exports.regenerateDescription = exports.validateDataIntegrity = exports.getUnitData = exports.getPropertyDataPreviews = exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getProperties = exports.createProperty = void 0;
const Property_1 = __importDefault(require("../models/Property"));
const actionChainService_1 = __importDefault(require("../services/actionChainService"));
const generatePropertyDescription = (property) => {
    const templates = [
        `This ${property.propertyType?.toLowerCase() || 'property'} offers ${property.numberOfUnits} ${property.numberOfUnits === 1 ? 'unit' : 'units'} in the heart of ${property.address?.city || 'the city'}. Located on ${property.address?.street || 'a prime street'}, this well-maintained property provides excellent investment potential with modern amenities and convenient access to local attractions.`,
        `Discover this exceptional ${property.propertyType?.toLowerCase() || 'property'} featuring ${property.numberOfUnits} ${property.numberOfUnits === 1 ? 'residential unit' : 'residential units'} in ${property.address?.city || 'a desirable location'}. The property at ${property.address?.street || 'this address'} combines comfort and convenience, making it an ideal choice for both residents and investors seeking quality accommodation.`,
        `Welcome to this outstanding ${property.propertyType?.toLowerCase() || 'property'} with ${property.numberOfUnits} ${property.numberOfUnits === 1 ? 'unit' : 'units'} situated in ${property.address?.city || 'a vibrant neighborhood'}. This ${property.address?.street || 'strategically located'} property offers excellent rental potential and is perfect for those looking for a solid investment opportunity in real estate.`,
        `Experience premium living at this ${property.propertyType?.toLowerCase() || 'property'} boasting ${property.numberOfUnits} ${property.numberOfUnits === 1 ? 'unit' : 'units'} in ${property.address?.city || 'an excellent area'}. Positioned on ${property.address?.street || 'a desirable street'}, this property combines modern living standards with investment appeal, offering residents comfort and investors strong returns.`
    ];
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
};
const createProperty = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
    }
    console.log('Create property request:', {
        body: req.body,
        file: req.file ? { filename: req.file.filename, originalname: req.file.originalname } : null
    });
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
        let imageUrl = req.body.imageUrl || '';
        if (req.file) {
            try {
                const { uploadToCloudinary, isCloudinaryConfigured } = await Promise.resolve().then(() => __importStar(require('../utils/cloudinary')));
                if (isCloudinaryConfigured()) {
                    imageUrl = await uploadToCloudinary(req.file, 'properties');
                    console.log('Image uploaded to Cloudinary:', imageUrl);
                }
                else {
                    imageUrl = `/uploads/images/${req.file.filename}`;
                    console.log('Image uploaded locally:', imageUrl);
                }
            }
            catch (error) {
                console.error('Image upload error:', error);
                imageUrl = `/uploads/images/${req.file.filename}`;
            }
        }
        const address = {
            street: req.body['address[street]'] || req.body.address?.street || '',
            city: req.body['address[city]'] || req.body.address?.city || '',
            state: req.body['address[state]'] || req.body.address?.state || '',
            zipCode: req.body['address[zipCode]'] || req.body.address?.zipCode || ''
        };
        const propertyData = {
            name: req.body.name,
            address: address,
            numberOfUnits: parseInt(req.body.numberOfUnits) || 1,
            propertyType: req.body.propertyType || 'Apartment',
            status: req.body.status || 'Active',
            imageUrl: imageUrl,
            organizationId: user.organizationId,
            createdBy: user._id,
            managedByAgentId: req.body.managedByAgentId || null,
            description: ''
        };
        console.log('Property data being created:', propertyData);
        propertyData.description = generatePropertyDescription(propertyData);
        const property = await Property_1.default.create(propertyData);
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
    console.log('Update property request:', {
        body: req.body,
        file: req.file ? { filename: req.file.filename, originalname: req.file.originalname } : null
    });
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
        const updates = {
            name: req.body.name,
            numberOfUnits: parseInt(req.body.numberOfUnits) || property.numberOfUnits,
            propertyType: req.body.propertyType || property.propertyType || 'Apartment',
            status: req.body.status || property.status
        };
        console.log('Property updates:', updates);
        const propertyObj = property.toObject();
        if (req.body.name !== property.name || req.body.propertyType !== propertyObj.propertyType || req.body.numberOfUnits !== property.numberOfUnits) {
            updates.description = generatePropertyDescription({ ...propertyObj, ...updates });
        }
        if (req.body['address[street]'] || req.body.address) {
            updates.address = {
                street: req.body['address[street]'] || req.body.address?.street || property.address?.street || '',
                city: req.body['address[city]'] || req.body.address?.city || property.address?.city || '',
                state: req.body['address[state]'] || req.body.address?.state || property.address?.state || '',
                zipCode: req.body['address[zipCode]'] || req.body.address?.zipCode || property.address?.zipCode || ''
            };
        }
        if (req.file) {
            try {
                const { uploadToCloudinary, isCloudinaryConfigured } = await Promise.resolve().then(() => __importStar(require('../utils/cloudinary')));
                if (isCloudinaryConfigured()) {
                    updates.imageUrl = await uploadToCloudinary(req.file, 'properties');
                    console.log('Image uploaded to Cloudinary:', updates.imageUrl);
                }
                else {
                    updates.imageUrl = `/uploads/images/${req.file.filename}`;
                    console.log('Image updated locally:', updates.imageUrl);
                }
            }
            catch (error) {
                console.error('Image upload error:', error);
                updates.imageUrl = `/uploads/images/${req.file.filename}`;
            }
        }
        else if (req.body.imageUrl !== undefined) {
            updates.imageUrl = req.body.imageUrl;
            console.log('Image URL set:', updates.imageUrl);
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
const getPropertyDataPreviews = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { propertyId } = req.params;
        const { unit } = req.query;
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        const [Payment, Receipt, Expense, MaintenanceRequest, Reminder, ApprovalRequest, AuditLog, Tenant] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/Receipt'))),
            Promise.resolve().then(() => __importStar(require('../models/Expense'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest'))),
            Promise.resolve().then(() => __importStar(require('../models/Reminder'))),
            Promise.resolve().then(() => __importStar(require('../models/ApprovalRequest'))),
            Promise.resolve().then(() => __importStar(require('../models/AuditLog'))),
            Promise.resolve().then(() => __importStar(require('../models/Tenant')))
        ]);
        let baseQuery = { propertyId, organizationId: user.organizationId };
        let tenantQuery = { propertyId, organizationId: user.organizationId };
        if (unit) {
            const tenant = await Tenant.default.findOne({ propertyId, unit, organizationId: user.organizationId });
            if (tenant) {
                baseQuery.tenantId = tenant._id;
                tenantQuery._id = tenant._id;
            }
            else {
                baseQuery.tenantId = null;
            }
        }
        const [payments, receipts, expenses, maintenance, reminders, approvals, auditLogs] = await Promise.all([
            Payment.default.find(baseQuery)
                .populate('tenantId', 'name unit')
                .sort({ paymentDate: -1 })
                .limit(5)
                .lean(),
            Receipt.default.find(baseQuery)
                .populate('tenantId', 'name unit')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            Expense.default.find(unit ? {} : { propertyId, organizationId: user.organizationId })
                .sort({ date: -1 })
                .limit(5)
                .lean(),
            MaintenanceRequest.default.find(baseQuery)
                .populate('tenantId', 'name unit')
                .populate('assignedTo', 'name')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            Reminder.default.find(unit ? tenantQuery : { propertyId, organizationId: user.organizationId })
                .populate('tenantId', 'name unit')
                .sort({ nextRunDate: 1 })
                .limit(5)
                .lean(),
            ApprovalRequest.default.find({ propertyId, organizationId: user.organizationId })
                .populate('requestedBy', 'name')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean(),
            AuditLog.default.find({
                organizationId: user.organizationId,
                $or: [{ resourceId: propertyId }, { 'metadata.propertyId': propertyId }]
            })
                .populate('userId', 'name')
                .sort({ timestamp: -1 })
                .limit(10)
                .lean()
        ]);
        res.status(200).json({
            success: true,
            data: {
                payments: payments.map(p => ({
                    _id: p._id,
                    amount: p.amount,
                    status: p.status,
                    paymentDate: p.paymentDate,
                    tenant: p.tenantId,
                    paymentMethod: p.paymentMethod,
                    rentMonth: p.rentMonth
                })),
                receipts: receipts.map(r => ({
                    _id: r._id,
                    receiptNumber: r.receiptNumber,
                    amount: r.amount,
                    paymentDate: r.paymentDate,
                    tenant: r.tenantId,
                    paymentMethod: r.paymentMethod
                })),
                expenses: expenses.map(e => ({
                    _id: e._id,
                    description: e.description,
                    amount: e.amount,
                    category: e.category,
                    date: e.date
                })),
                maintenance: maintenance.map(m => ({
                    _id: m._id,
                    description: m.description,
                    status: m.status,
                    priority: m.priority,
                    tenant: m.tenantId,
                    assignedTo: m.assignedTo,
                    createdAt: m.createdAt
                })),
                reminders: reminders.map(r => ({
                    _id: r._id,
                    title: r.title,
                    type: r.type,
                    status: r.status,
                    nextRunDate: r.nextRunDate,
                    tenant: r.tenantId
                })),
                approvals: approvals.map(a => ({
                    _id: a._id,
                    type: a.type,
                    description: a.description,
                    status: a.status,
                    priority: a.priority,
                    requestedBy: a.requestedBy,
                    createdAt: a.createdAt
                })),
                auditLogs: auditLogs.map(l => ({
                    _id: l._id,
                    action: l.action,
                    resource: l.resource,
                    description: l.description,
                    user: l.userId,
                    timestamp: l.timestamp,
                    severity: l.severity
                }))
            }
        });
    }
    catch (error) {
        console.error('Property data previews error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getPropertyDataPreviews = getPropertyDataPreviews;
const getUnitData = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { propertyId, unitNumber } = req.params;
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }
        const [Payment, Receipt, Expense, MaintenanceRequest, Reminder, Tenant] = await Promise.all([
            Promise.resolve().then(() => __importStar(require('../models/Payment'))),
            Promise.resolve().then(() => __importStar(require('../models/Receipt'))),
            Promise.resolve().then(() => __importStar(require('../models/Expense'))),
            Promise.resolve().then(() => __importStar(require('../models/MaintenanceRequest'))),
            Promise.resolve().then(() => __importStar(require('../models/Reminder'))),
            Promise.resolve().then(() => __importStar(require('../models/Tenant')))
        ]);
        const tenant = await Tenant.default.findOne({
            propertyId,
            unit: unitNumber,
            organizationId: user.organizationId
        });
        if (!tenant) {
            res.status(404).json({ success: false, message: 'Unit not found or vacant' });
            return;
        }
        const [payments, receipts, expenses, maintenance, reminders] = await Promise.all([
            Payment.default.find({ tenantId: tenant._id, propertyId, organizationId: user.organizationId })
                .sort({ paymentDate: -1 })
                .lean(),
            Receipt.default.find({ tenantId: tenant._id, propertyId, organizationId: user.organizationId })
                .sort({ createdAt: -1 })
                .lean(),
            Expense.default.find({ propertyId, organizationId: user.organizationId })
                .sort({ date: -1 })
                .lean(),
            MaintenanceRequest.default.find({ tenantId: tenant._id, propertyId, organizationId: user.organizationId })
                .populate('assignedTo', 'name')
                .sort({ createdAt: -1 })
                .lean(),
            Reminder.default.find({ tenantId: tenant._id, organizationId: user.organizationId })
                .sort({ nextRunDate: 1 })
                .lean()
        ]);
        res.status(200).json({
            success: true,
            data: {
                tenant: {
                    _id: tenant._id,
                    name: tenant.name,
                    email: tenant.email,
                    unit: tenant.unit,
                    rentAmount: tenant.rentAmount,
                    status: tenant.status
                },
                payments: payments.map(p => ({
                    _id: p._id,
                    amount: p.amount,
                    status: p.status,
                    paymentDate: p.paymentDate,
                    paymentMethod: p.paymentMethod,
                    rentMonth: p.rentMonth
                })),
                receipts: receipts.map(r => ({
                    _id: r._id,
                    receiptNumber: r.receiptNumber,
                    amount: r.amount,
                    paymentDate: r.paymentDate,
                    paymentMethod: r.paymentMethod
                })),
                expenses: expenses.map(e => ({
                    _id: e._id,
                    description: e.description,
                    amount: e.amount,
                    category: e.category,
                    date: e.date
                })),
                maintenance: maintenance.map(m => ({
                    _id: m._id,
                    description: m.description,
                    status: m.status,
                    priority: m.priority,
                    assignedTo: m.assignedTo,
                    createdAt: m.createdAt
                })),
                reminders: reminders.map(r => ({
                    _id: r._id,
                    title: r.title,
                    type: r.type,
                    status: r.status,
                    nextRunDate: r.nextRunDate
                }))
            }
        });
    }
    catch (error) {
        console.error('Unit data error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getUnitData = getUnitData;
const validateDataIntegrity = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { validatePropertyTenantConnection, fixDataInconsistencies } = await Promise.resolve().then(() => __importStar(require('../utils/dataValidation')));
        const { fix = false } = req.query;
        if (fix === 'true') {
            const fixResult = await fixDataInconsistencies(user.organizationId);
            res.status(200).json({
                success: true,
                action: 'fix',
                data: fixResult
            });
        }
        else {
            const validation = await validatePropertyTenantConnection(user.organizationId);
            res.status(200).json({
                success: true,
                action: 'validate',
                data: validation
            });
        }
    }
    catch (error) {
        console.error('Data validation error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.validateDataIntegrity = validateDataIntegrity;
const regenerateDescription = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        const newDescription = generatePropertyDescription(property.toObject());
        const updatedProperty = await Property_1.default.findByIdAndUpdate(req.params.id, { description: newDescription }, { new: true });
        res.status(200).json({ success: true, data: updatedProperty });
    }
    catch (error) {
        console.error('Regenerate description error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.regenerateDescription = regenerateDescription;
const getPropertyUnits = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized' });
        return;
    }
    try {
        const { propertyId } = req.params;
        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== user.organizationId.toString()) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;
        }
        const Tenant = (await Promise.resolve().then(() => __importStar(require('../models/Tenant')))).default;
        const tenants = await Tenant.find({
            propertyId: propertyId,
            organizationId: user.organizationId,
            status: 'Active'
        });
        const units = [];
        const numberOfUnits = property.numberOfUnits || 1;
        for (let i = 1; i <= numberOfUnits; i++) {
            const unitNumber = i.toString();
            const tenant = tenants.find(t => t.unit === unitNumber);
            units.push({
                unitNumber,
                rentAmount: tenant?.rentAmount || 0,
                isOccupied: !!tenant,
                propertyId: property._id,
                tenantId: tenant?._id,
                tenantName: tenant?.name
            });
        }
        res.status(200).json({ success: true, data: units });
    }
    catch (error) {
        console.error('Get property units error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getPropertyUnits = getPropertyUnits;
