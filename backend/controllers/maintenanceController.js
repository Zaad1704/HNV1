"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMaintenanceRequest = exports.updateMaintenanceRequest = exports.getMaintenanceRequestById = exports.getOrgMaintenanceRequests = exports.createMaintenanceRequest = void 0;
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const Property_1 = __importDefault(require("../models/Property"));
const auditService_1 = __importDefault(require("../services/auditService"));
const mongoose_1 = require("mongoose");
const createMaintenanceRequest = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;

        const { propertyId, description, status, priority, tenantId, category, notes, assignedTo } = req.body;
        if (!propertyId || !description) {
            res.status(400).json({ success: false, message: 'Property ID and description are required.' });
            return;

        const property = await Property_1.default.findById(propertyId);
        if (!property || property.organizationId.toString() !== req.user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to create requests for this property.' });
            return;

        const newRequest = await MaintenanceRequest_1.default.create({
            organizationId: req.user.organizationId,
            propertyId: new mongoose_1.Types.ObjectId(propertyId),
            tenantId: tenantId ? new mongoose_1.Types.ObjectId(tenantId) : undefined,
            description,
            status: status || 'Open',
            priority: priority || 'Medium',
            requestedBy: req.user._id,
            category,
            notes,
            assignedTo: assignedTo ? new mongoose_1.Types.ObjectId(assignedTo) : undefined,
        });
        auditService_1.default.recordAction(req.user._id, req.user.organizationId, 'MAINTENANCE_REQUEST_CREATED', { requestId: newRequest._id.toString(), description: newRequest.description, propertyId: property._id.toString() });
        res.status(201).json({ success: true, data: newRequest });

    catch (error) {
        console.error("Error creating maintenance request:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });

};
exports.createMaintenanceRequest = createMaintenanceRequest;
const getOrgMaintenanceRequests = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;

        const requests = await MaintenanceRequest_1.default.find({ organizationId: req.user.organizationId })
            .populate('propertyId', 'name address')
            .populate('requestedBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('tenantId', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: requests.length, data: requests });

    catch (error) {
        console.error("Error fetching maintenance requests:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });

};
exports.getOrgMaintenanceRequests = getOrgMaintenanceRequests;
const getMaintenanceRequestById = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;

        const request = await MaintenanceRequest_1.default.findById(req.params.id)
            .populate('propertyId', 'name address')
            .populate('requestedBy', 'name email')
            .populate('assignedTo', 'name email')
            .populate('tenantId', 'name email');
        if (!request) {
            res.status(404).json({ success: false, message: 'Maintenance request not found' });
            return;

        if (request.organizationId.toString() !== req.user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to access this request.' });
            return;

        if (req.user.role === 'Tenant' && request.requestedBy?._id?.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Tenants can only view their own reported requests.' });
            return;

        res.status(200).json({ success: true, data: request });

    catch (error) {
        console.error("Error fetching maintenance request by ID:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });

};
exports.getMaintenanceRequestById = getMaintenanceRequestById;
const updateMaintenanceRequest = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;

        let request = await MaintenanceRequest_1.default.findById(req.params.id);
        if (!request) {
            res.status(404).json({ success: false, message: 'Maintenance request not found' });
            return;

        if (request.organizationId.toString() !== req.user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to update this request.' });
            return;

        if (req.user.role === 'Tenant') {
            const allowedUpdates = ['description', 'notes'];
            const updates = Object.keys(req.body);
            const isValidOperation = updates.every(update => allowedUpdates.includes(update));
            if (!isValidOperation) {
                res.status(403).json({ success: false, message: 'Tenants can only update description and notes.' });
                return;


        request = await MaintenanceRequest_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (request) {
            auditService_1.default.recordAction(req.user._id, req.user.organizationId, 'MAINTENANCE_REQUEST_UPDATED', { requestId: request._id.toString(), status: request.status, description: request.description });

        res.status(200).json({ success: true, data: request });

    catch (error) {
        console.error("Error updating maintenance request:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });

};
exports.updateMaintenanceRequest = updateMaintenanceRequest;
const deleteMaintenanceRequest = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ success: false, message: 'Not authorized' });
            return;

        const request = await MaintenanceRequest_1.default.findById(req.params.id);
        if (!request) {
            res.status(404).json({ success: false, message: 'Maintenance request not found' });
            return;

        if (request.organizationId.toString() !== req.user.organizationId.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this request.' });
            return;

        if (!['Landlord', 'Agent', 'Super Admin'].includes(req.user.role)) {
            res.status(403).json({ success: false, message: 'Your role is not authorized to delete maintenance requests.' });
            return;

        await request.deleteOne();
        auditService_1.default.recordAction(req.user._id, req.user.organizationId, 'MAINTENANCE_REQUEST_DELETED', { requestId: request._id.toString(), description: request.description });
        res.status(200).json({ success: true, message: 'Maintenance request deleted successfully.' });

    catch (error) {
        console.error("Error deleting maintenance request:", error);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });

};
exports.deleteMaintenanceRequest = deleteMaintenanceRequest;
//# sourceMappingURL=maintenanceController.js.map