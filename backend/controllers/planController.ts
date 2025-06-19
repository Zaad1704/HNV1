import { Request, Response } from 'express';
import Plan from '../models/Plan';
// FIX: AuthenticatedRequest is no longer needed.
import auditService from '../services/auditService';
import mongoose from 'mongoose';

// @desc    Get all subscription plans
// @route   GET /api/plans
// @access  Public
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
export const createPlan = async (req: Request, res: Response) => { // FIX: Use Request
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const newPlan = await Plan.create(req.body);
        
        auditService.recordAction(
            req.user._id,
            req.user.organizationId,
            'PLAN_CREATE',
            { planId: newPlan._id.toString(), planName: newPlan.name }
        );
        res.status(201).json({ success: true, data: newPlan });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update an existing subscription plan
// @route   PUT /api/plans/:id
// @access  Private (Super Admin)
export const updatePlan = async (req: Request, res: Response) => { // FIX: Use Request
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        
        auditService.recordAction(
            req.user._id,
            req.user.organizationId,
            'PLAN_UPDATE',
            { planId: plan._id.toString(), planName: plan.name }
        );
        res.status(200).json({ success: true, data: plan });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Delete a subscription plan
// @route   DELETE /api/plans/:id
// @access  Private (Super Admin)
export const deletePlan = async (req: Request, res: Response) => { // FIX: Use Request
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        const plan = await Plan.findById(req.params.id);
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }
        await plan.deleteOne();
        
        auditService.recordAction(
            req.user._id,
            req.user.organizationId,
            'PLAN_DELETE',
            { planId: plan._id.toString(), planName: plan.name }
        );
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
