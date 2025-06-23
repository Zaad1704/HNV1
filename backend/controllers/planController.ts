// backend/controllers/planController.ts
import { Request, Response } from 'express';
import Plan from '../models/Plan';
import auditService from '../services/auditService';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware'; // Re-import AuthenticatedRequest

export const getPlans = async (req: Request, res: Response) => { // This is a public route, keep Request
    try {
        const plans = await Plan.find({}).sort({ price: 1 });
        res.status(200).json({ success: true, data: plans });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

export const createPlan = async (req: AuthenticatedRequest, res: Response) => { // Changed to AuthenticatedRequest
    try {
        if (!req.user || !req.user.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
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

export const updatePlan = async (req: AuthenticatedRequest, res: Response) => { // Changed to AuthenticatedRequest
    try {
        if (!req.user || !req.user.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
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

export const deletePlan = async (req: AuthenticatedRequest, res: Response) => { // Changed to AuthenticatedRequest
    try {
        if (!req.user || !req.user.organizationId) {
            return res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' });
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
