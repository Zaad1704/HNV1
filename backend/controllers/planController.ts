import { Request, Response } from 'express';
import Plan from '../models/Plan';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import auditService from '../services/auditService';
import mongoose from 'mongoose';

// @desc    Get all subscription plans
// @route   GET /api/plans
// @access  Private (Super Admin)
export const getPlans = async (req: Request, res: Response) => {
    try {
        const plans = await Plan.find({}).sort({ price: 1 });
        res.status(200).json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create a new subscription plan
// @route   POST /api/plans
// @access  Private (Super Admin)
export const createPlan = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const newPlan = await Plan.create(req.body);
        // FIX: Cast newPlan._id to ObjectId before .toString()
        auditService.recordAction(
            req.user!._id as mongoose.Types.ObjectId,
            req.user!.organizationId as mongoose.Types.ObjectId,
            'PLAN_CREATE',
            { planId: (newPlan._id as mongoose.Types.ObjectId).toString(), planName: newPlan.name }
        );
        res.status(201).json({ success: true, data: newPlan });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update an existing subscription plan
// @route   PUT /api/plans/:id
// @access  Private (Super Admin)
export const updatePlan = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        // FIX: Cast plan._id to ObjectId before .toString()
        auditService.recordAction(
            req.user!._id as mongoose.Types.ObjectId,
            req.user!.organizationId as mongoose.Types.ObjectId,
            'PLAN_UPDATE',
            { planId: (plan._id as mongoose.Types.ObjectId).toString(), planName: plan.name }
        );
        res.status(200).json({ success: true, data: plan });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a subscription plan
// @route   DELETE /api/plans/:id
// @access  Private (Super Admin)
export const deletePlan = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        await plan.deleteOne();
        // FIX: Cast plan._id to ObjectId before .toString()
        auditService.recordAction(
            req.user!._id as mongoose.Types.ObjectId,
            req.user!.organizationId as mongoose.Types.ObjectId,
            'PLAN_DELETE',
            { planId: (plan._id as mongoose.Types.ObjectId).toString(), planName: plan.name }
        );
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
