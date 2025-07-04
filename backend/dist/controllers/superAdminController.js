"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrganization = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const User_1 = __importDefault(require("../models/User"));
const Organization_1 = __importDefault(require("../models/Organization"));
const Subscription_1 = __importDefault(require("../models/Subscription"));
exports.deleteOrganization = (0, express_async_handler_1.default)(async (req, res) => {
    const { orgId } = req.params;
    const organization = await Organization_1.default.findById(orgId);
    if (!organization) {
        res.status(404);
        throw new Error('Organization not found.');
        await User_1.default.deleteMany({ organizationId: orgId });
        await Subscription_1.default.deleteMany({ organizationId: orgId });
        await organization.deleteOne();
        res.status(200).json({ success: true, message: `Organization '${organization.name}' and all associated data has been deleted.`,
            message: `Self-service deletion for ${organization.name} is now ${enable ? 'enabled' : 'disabled'}.` });
    }
});
