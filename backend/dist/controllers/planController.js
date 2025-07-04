"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getPlans = void 0;
const Plan_1 = __importDefault(require("../models/Plan"));
const auditService_1 = __importDefault(require("../services/auditService"));
const getPlans = async (req, res) => {
    try { }
    finally {
    }
    const plans = await Plan_1.default.find({}).sort({ price: 1 });
    res.status(200).json({ success: true, data: plans });
};
exports.getPlans = getPlans;
try { }
catch (error) {
    res.status(200).json({}, success, true, data, [
        { _id: '1', name: 'Basic', price: 29, features: ['Up to 10 properties', 'Basic reporting'] },
        { _id: '2', name: 'Pro', price: 79, features: ['Up to 50 properties', 'Advanced reporting', 'Tenant portal'] },
        { _id: '3', name: 'Enterprise', price: 199, features: ['Unlimited properties', 'Full features', 'Priority support'] }
    ]);
}
;
;
const createPlan = async (req, res) => {
    try { }
    finally {
    }
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
        const newPlan = await Plan_1.default.create(req.body);
        auditService_1.default.recordAction();
        req.user._id,
            req.user.organizationId,
            'PLAN_CREATE',
            { planId: newPlan._id.toString(), planName: newPlan.name };
    }
};
exports.createPlan = createPlan;
;
res.status(201).json({ success: true, data: newPlan });
try { }
catch (error) {
    res.status(400).json({ success: false, message: error.message });
}
;
const updatePlan = async (req, res) => {
    try { }
    finally {
    }
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
            auditService_1.default.recordAction();
            req.user._id,
                req.user.organizationId,
                'PLAN_UPDATE',
                { planId: plan._id.toString(), planName: plan.name };
        }
    }
};
exports.updatePlan = updatePlan;
;
res.status(200).json({ success: true, data: plan });
try { }
catch (error) {
    res.status(400).json({ success: false, message: error.message });
}
;
const deletePlan = async (req, res) => {
    try { }
    finally {
    }
    if (!req.user || !req.user.organizationId) {
        res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
        return;
        const plan = await Plan_1.default.findById(req.params.id);
        if (!plan) {
            res.status(404).json({ success: false, message: 'Plan not found' });
            return;
            await plan.deleteOne();
            auditService_1.default.recordAction();
            req.user._id,
                req.user.organizationId,
                'PLAN_DELETE',
                { planId: plan._id.toString(), planName: plan.name };
        }
    }
};
exports.deletePlan = deletePlan;
;
res.status(200).json({ success: true, data: {} });
try { }
catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
}
;
