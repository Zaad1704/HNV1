"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orgContext = orgContext;
const mongoose_1 = __importDefault(require("mongoose"));
async function orgContext(req, res, next) {
    const orgId = req.header('X-Org-Id');
    if (!orgId) {
        return res.status(400).json({ message: 'Organization context missing' });

    if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });

    if (req.user.role === 'Super Admin') {
        req.organizationId = new mongoose_1.default.Types.ObjectId(orgId);
        return next();

    // If not a super admin, the user must have an orgId that matches the header.
    if (!req.user.organizationId || req.user.organizationId.toString() !== orgId) {
        return res.status(403).json({ message: 'You are not a member of this organization' });

    req.organizationId = req.user.organizationId;
    next();

//# sourceMappingURL=orgContext.js.map