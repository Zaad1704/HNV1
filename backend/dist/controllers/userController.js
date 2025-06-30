"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestAccountDeletion = exports.updatePassword = exports.getManagedAgents = exports.getOrgUsers = exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const getUsers = (0, express_async_handler_1.default)(async (req, res) => {
    const users = await User_1.default.find({});
    res.json(users);
});
exports.getUsers = getUsers;
const getUser = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
exports.getUser = getUser;
const updateUser = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.params.id);
    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;
        const updatedUser = await user.save();
        res.json(updatedUser);
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
exports.updateUser = updateUser;
const deleteUser = (0, express_async_handler_1.default)(async (req, res) => {
    const user = await User_1.default.findById(req.params.id);
    if (user) {
        await user.deleteOne();
        res.json({ message: 'User removed' });
    }
    else {
        res.status(404);
        throw new Error('User not found');
    }
});
exports.deleteUser = deleteUser;
const getOrgUsers = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user) {
        res.status(401);
        throw new Error('Not authorized');
    }
    const users = await User_1.default.find({ organizationId: req.user.organizationId });
    res.status(200).json({ success: true, data: users });
});
exports.getOrgUsers = getOrgUsers;
const getManagedAgents = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user || req.user.role !== 'Landlord') {
        res.status(403);
        throw new Error('User is not a Landlord');
    }
    const agents = await User_1.default.find({ '_id': { $in: req.user.managedAgentIds || [] } });
    res.status(200).json({ success: true, data: agents });
});
exports.getManagedAgents = getManagedAgents;
const updatePassword = (0, express_async_handler_1.default)(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!req.user) {
        res.status(401);
        throw new Error('User not authenticated');
    }
    const user = await User_1.default.findById(req.user._id).select('+password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    if (!(await user.matchPassword(currentPassword))) {
        res.status(401);
        throw new Error('Incorrect current password');
    }
    user.password = newPassword;
    await user.save();
    const token = user.getSignedJwtToken();
    res.status(200).json({
        success: true,
        message: 'Password updated successfully.',
        token: token
    });
});
exports.updatePassword = updatePassword;
const requestAccountDeletion = (0, express_async_handler_1.default)(async (req, res) => {
    if (!req.user || !req.user.organizationId) {
        res.status(401);
        throw new Error('Not authorized or not part of an organization');
    }
    const organization = await Organization_1.default.findById(req.user.organizationId);
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found');
    }
    if (organization.allowSelfDeletion === false) {
        res.status(403);
        throw new Error('Self-service account deletion has been disabled by the platform administrator. Please contact support.');
    }
    organization.status = 'pending_deletion';
    if (!organization.dataManagement) {
        organization.dataManagement = {};
    }
    organization.dataManagement.accountDeletionRequestedAt = new Date();
    await organization.save();
    res.status(200).json({ success: true, message: 'Account deletion request received. Your account will be permanently deleted after the grace period.' });
});
exports.requestAccountDeletion = requestAccountDeletion;
