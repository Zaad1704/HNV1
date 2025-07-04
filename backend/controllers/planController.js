"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getPlans = void 0;
const Plan_1 = __importDefault(require("../models/Plan"));
const auditService_1 = __importDefault(require("../services/auditService"));
const getPlans = async (req, res) => {
    try {
        const plans = await Plan_1.default.find({}).sort({ price: 1 });
        res.status(200).json({ success: true, data: plans });

    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });

};
exports.getPlans = getPlans;
const createPlan = async (req, res) => {
    try {
        if (!req.user || !req.user.organizationId) {
            res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
            return;

        const newPlan = await Plan_1.default.create(req.body);
        auditService_1.default.recordAction(req.user._id, req.user.organizationId, 'PLAN_CREATE', { planId: newPlan._id.toString(), planName: newPlan.name });
        res.status(201).json({ success: true, data: newPlan });

    catch (error) {
        res.status(400).json({ success: false, message: error.message });

};
exports.createPlan = createPlan;
const updatePlan = async (req, res) => {
    try {
        if (!req.user || !req.user.organizationId) {
            res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
            return;

        const plan = await Plan_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!plan) {
            res.status(404).json({ success: false, message: 'Plan not found' });
            return;

        auditService_1.default.recordAction(req.user._id, req.user.organizationId, 'PLAN_UPDATE', { planId: plan._id.toString(), planName: plan.name });
        res.status(200).json({ success: true, data: plan });

    catch (error) {
        res.status(400).json({ success: false, message: error.message });

};
exports.updatePlan = updatePlan;
const deletePlan = async (req, res) => {
    try {
        if (!req.user || !req.user.organizationId) {
            res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
            return;

        const plan = await Plan_1.default.findById(req.params.id);
        if (!plan) {
            res.status(404).json({ success: false, message: 'Plan not found' });
            return;

        await plan.deleteOne();
        auditService_1.default.recordAction(req.user._id, req.user.organizationId, 'PLAN_DELETE', { planId: plan._id.toString(), planName: plan.name });
        res.status(200).json({ success: true, data: {} });

    catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });

};
exports.deletePlan = deletePlan;
//# sourceMappingURL=planController.js.map