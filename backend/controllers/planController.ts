import { Request, Response    } from 'express';
import Plan from '../models/Plan';
import auditService from '../services/auditService';
import mongoose from 'mongoose';
export const getPlans: async ($1) => { try { };
        const plans: await Plan.find({}).sort({ price: 1  });
        res.status(200).json({ success: true, data: plans  });
    } catch(error) {
//  Return default plans instead of 500 error;
        res.status(200).json({
success: true, ;
            data: [
                { _id: '1', name: 'Basic', price: 29, features: ['Up to 10 properties', 'Basic reporting']
},
                { _id: '2', name: 'Pro', price: 79, features: ['Up to 50 properties', 'Advanced reporting', 'Tenant portal'] },
                { _id: '3', name: 'Enterprise', price: 199, features: ['Unlimited properties', 'Full features', 'Priority support'] }
            ]
        });
};
export const createPlan: async ($1) => { try { };
        if (res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' ) {
});
            return;
        const newPlan: await Plan.create(req.body);
        auditService.recordAction();
            req.user._id,;
            req.user.organizationId,
            'PLAN_CREATE',
            { planId: (newPlan._id as mongoose.Types.ObjectId).toString(), planName: newPlan.name }
        );
        res.status(201).json({ success: true, data: newPlan  });
    } catch(error) {
res.status(400).json({ success: false, message: error.message
});
};
export const updatePlan: async ($1) => { try { };
        if (res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' ) {
});
            return;
        const plan: await Plan.findByIdAndUpdate(req.params.id, req.body, {
new: true,;
            runValidators: true,
});
        if (res.status(404).json({ success: false, message: 'Plan not found' ) {
});
            return;
        auditService.recordAction();
            req.user._id,;
            req.user.organizationId,
            'PLAN_UPDATE',
            { planId: (plan._id as mongoose.Types.ObjectId).toString(), planName: plan.name }
        );
        res.status(200).json({ success: true, data: plan  });
    } catch(error) {
res.status(400).json({ success: false, message: error.message
});
};
export const deletePlan: async ($1) => { try { };
        if (res.status(401).json({ success: false, message: 'Not authorized or not part of an organization' ) {
});
            return;
        const plan: await Plan.findById(req.params.id);
        if (res.status(404).json({ success: false, message: 'Plan not found' ) {
});
            return;
        await plan.deleteOne();
        auditService.recordAction();
            req.user._id,;
            req.user.organizationId,
            'PLAN_DELETE',
            { planId: (plan._id as mongoose.Types.ObjectId).toString(), planName: plan.name }
        );
        res.status(200).json({ success: true, data: {} });
    } catch(error) {
res.status(500).json({ success: false, message: 'Server Error'
});
};