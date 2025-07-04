"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getProperties = exports.createProperty = void 0;
const Property_1 = __importDefault(require("../models/Property"));
const createProperty = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    try {
        const imageUrl = req.file ? req.file.imageUrl : undefined;
        const property = await Property_1.default.create({
            ...req.body,
            imageUrl: imageUrl,
            organizationId: user.organizationId,
            createdBy: user._id
        });
        res.status(201).json({
            success: true,
            data: property
        });

    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });

};
exports.createProperty = createProperty;
const getProperties = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    try {
        const properties = await Property_1.default.find({ organizationId: user.organizationId });
        res.status(200).json({ success: true, data: properties });

    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });

};
exports.getProperties = getProperties;
const getPropertyById = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;

        if (!property.organizationId.equals(user.organizationId)) {
            res.status(403).json({ success: false, message: 'Not authorized to view this property' });
            return;

        res.status(200).json({ success: true, data: property });

    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });

};
exports.getPropertyById = getPropertyById;
const updateProperty = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    try {
        let property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;

        if (!property.organizationId.equals(user.organizationId)) {
            res.status(403).json({ success: false, message: 'Not authorized to update this property' });
            return;

        const updates = { ...req.body };
        if (req.file) {
            updates.imageUrl = req.file.imageUrl;

        property = await Property_1.default.findByIdAndUpdate(req.params.id, updates, {
            new: true,
            runValidators: true
        });
        res.status(200).json({ success: true, data: property });

    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });

};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res) => {
    const user = req.user;
    if (!user || !user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;

    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property) {
            res.status(404).json({ success: false, message: 'Property not found' });
            return;

        if (!property.organizationId.equals(user.organizationId)) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
            return;

        await property.deleteOne();
        res.status(200).json({ success: true, data: {} });

    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });

};
exports.deleteProperty = deleteProperty;
//# sourceMappingURL=propertyController.js.map