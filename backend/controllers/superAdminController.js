"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlanDistribution = exports.getPlatformGrowth = exports.getAllMaintenanceRequests = exports.getGlobalBilling = exports.getModerators = exports.updateUserByAdmin = exports.toggleSelfDeletion = exports.updateOrganizationSubscription = exports.revokeLifetimeAccess = exports.grantLifetimeAccess = exports.updateSubscriptionStatus = exports.getAllUsers = exports.getAllOrganizations = exports.getDashboardStats = exports.deleteOrganization = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
const MaintenanceRequest_1 = __importDefault(require("../models/MaintenanceRequest"));
const Plan_1 = __importDefault(require("../models/Plan"));
const date_fns_1 = require("date-fns");
const mongoose_1 = require("mongoose");
exports.deleteOrganization = (0, express_async_handler_1.default)(async (req, res) => {
    const { orgId } = req.params;
    const organization = await Organization_1.default.findById(orgId);
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found.');

    // Perform a soft cascade delete
    // 1. Delete all users belonging to the organization
    await User_1.default.deleteMany({ organizationId: orgId });
    // 2. Delete the subscription associated with the organization
    await Subscription_1.default.deleteMany({ organizationId: orgId });
    // 3. Delete the organization itself
    await organization.deleteOne();
    res.status(200).json({ success: true, message: `Organization '${organization.name}' and all associated data has been deleted.
        message: `Self-service deletion for ${organization.name} is now ${enable ? 'enabled' : 'disabled'}.