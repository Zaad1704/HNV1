import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { getPlans, createPlan, updatePlan, deletePlan } from '../controllers/planController';
import { protect } from '../middleware/authMiddleware';
import { authorize } from '../middleware/rbac'; 

const router = Router();

router.route('/')
    .get(asyncHandler(getPlans)) 
    .post(protect, authorize(['Super Admin']), asyncHandler(createPlan));

router.route('/:id')
    .put(protect, authorize(['Super Admin']), asyncHandler(updatePlan))
    .delete(protect, authorize(['Super Admin']), asyncHandler(deletePlan));

export default router;
